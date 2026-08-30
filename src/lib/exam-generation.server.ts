import { EXAM_SYSTEM_PROMPT, buildExamUserPrompt } from "./exam-prompt";

export type ExamGenerationInput = {
  etapa: string;
  ano: string;
  componente: string;
  tema: string;
  dificuldade: string;
  quantidade: number;
  observacoes?: string | undefined;
};

export type ExamQuestion = {
  number: number;
  type: string;
  question: string;
  context: string | null;
  alternatives: string[] | null;
  expectedAnswer: string;
  criteria: string[];
};

export type ExamRubricItem = {
  criterion: string;
  excellent: string;
  good: string;
  satisfactory: string;
  needsImprovement: string;
};

export type ExamContent = {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  instructions: string;
  questions: ExamQuestion[];
  rubric: ExamRubricItem[];
  bnccCodes: { code: string; description: string }[];
  notes: string | null;
};

export class ExamGenerationError extends Error {
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
  if (start === -1 || end === -1) throw new ExamGenerationError("Resposta inválida da IA", 502);
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateExam(input: ExamGenerationInput): Promise<ExamContent> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new ExamGenerationError("Serviço de IA não configurado.", 500);

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
        { role: "system", content: EXAM_SYSTEM_PROMPT },
        { role: "user", content: buildExamUserPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[AI] Error:", res.status, errorBody);
    throw new ExamGenerationError("Serviço de IA indisponível. Tente novamente.", res.status);
  }

  const json = await res.json();
  if (!json.choices?.[0]?.message?.content) {
    throw new ExamGenerationError("Resposta vazia da IA", 502);
  }

  try {
    const parsed = extractJson(json.choices[0].message.content);
    return parsed as ExamContent;
  } catch (err) {
    console.error("[AI] Parse error:", err);
    throw new ExamGenerationError("Erro ao processar resposta da IA", 502);
  }
}
