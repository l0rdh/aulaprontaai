import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  etapa: z.string().trim().min(1).max(60),
  ano: z.string().trim().min(1).max(60),
  componente: z.string().trim().min(1).max(80),
  tema: z.string().trim().min(3).max(140),
  dificuldade: z.enum(["facil", "media", "dificil"]),
  quantidade: z.number().int().min(3).max(20),
  observacoes: z.string().trim().max(500).optional(),
});

export const createExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { generateExam, ExamGenerationError } = await import("./exam-generation.server");

    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("plan")
      .eq("id", context.userId)
      .maybeSingle();

    if (profileError) throw new Error("Não consegui verificar seu plano.");
    if (!profile || profile.plan !== "pro") {
      throw new Error("Apenas membros Pro podem gerar avaliações.");
    }

    let content;
    try {
      content = await generateExam(data);
    } catch (err) {
      if (err instanceof ExamGenerationError) throw new Error(err.message);
      throw new Error("Não consegui gerar a avaliação agora.");
    }

    const { data: exam, error: insertError } = await context.supabase
      .from("generated_exams")
      .insert({
        user_id: context.userId,
        title: content.title,
        question_count: content.questions.length,
        difficulty: data.dificuldade,
        content_json: JSON.parse(JSON.stringify(content)),
      })
      .select("id")
      .single();

    if (insertError || !exam) throw new Error("Não consegui salvar a avaliação gerada.");

    return { id: exam.id as string };
  });
