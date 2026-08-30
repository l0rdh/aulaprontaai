import { SYSTEM_PROMPT, buildUserPrompt } from "./plan-prompt";
import type { LessonContent } from "./plan-content";

export type GenerationInput = {
  etapa: string;
  ano: string;
  componente: string;
  tema: string;
  duracao: number;
  observacoes?: string;
};

export class PlanGenerationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractJson(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new PlanGenerationError("Resposta inválida da IA", 502);
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateLessonPlan(input: GenerationInput): Promise<LessonContent> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new PlanGenerationError("Serviço de IA não configurado.", 500);

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    const detalhe = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new PlanGenerationError(
        "Muitas gerações ao mesmo tempo. Tente novamente em instantes.",
        429,
      );
    }
    if (res.status === 402 || res.status === 403) {
      throw new PlanGenerationError(
        "A geração por IA está temporariamente indisponível. Fale com o suporte.",
        res.status,
      );
    }
    console.error("AI gateway error", res.status, detalhe.slice(0, 500));
    throw new PlanGenerationError("Não consegui gerar o plano agora.", 502);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new PlanGenerationError("A IA não retornou conteúdo.", 502);

  const parsed = extractJson(content) as LessonContent;
  if (!parsed?.title || !Array.isArray(parsed.schedule) || parsed.schedule.length === 0) {
    throw new PlanGenerationError("A IA retornou um plano incompleto.", 502);
  }

  return {
    ...parsed,
    specificObjectives: parsed.specificObjectives ?? [],
    bnccCodes: parsed.bnccCodes ?? [],
    materials: parsed.materials ?? [],
    assessment: parsed.assessment ?? { type: "", description: "", criteria: [] },
    homework: parsed.homework ?? null,
    inclusionNotes: parsed.inclusionNotes ?? null,
    notes: parsed.notes ?? null,
  };
}
