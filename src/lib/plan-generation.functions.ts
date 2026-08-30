import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  etapa: z.string().trim().min(1).max(60),
  ano: z.string().trim().min(1).max(60),
  componente: z.string().trim().min(1).max(80),
  tema: z.string().trim().min(3).max(140),
  duracao: z.number().int().min(10).max(240),
  observacoes: z.string().trim().max(500).optional(),
});

export const createLessonPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { generateLessonPlan, PlanGenerationError } = await import("./plan-generation.server");

    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("credits")
      .eq("id", context.userId)
      .maybeSingle();

    if (profileError) throw new Error("Não consegui verificar seus créditos.");
    if (!profile || profile.credits <= 0) {
      throw new Error("Você não tem créditos suficientes.");
    }

    let content;
    try {
      content = await generateLessonPlan(data);
    } catch (err) {
      if (err instanceof PlanGenerationError) throw new Error(err.message);
      throw new Error("Não consegui gerar o plano agora.");
    }

    const { data: plan, error: insertError } = await context.supabase
      .from("lesson_plans")
      .insert({
        user_id: context.userId,
        title: content.title,
        grade_level: data.ano,
        subject: data.componente,
        theme: data.tema,
        bncc_codes: content.bnccCodes.map((b) => b.code),
        content_json: JSON.parse(JSON.stringify(content)),
        duration_minutes: data.duracao,
      })
      .select("id")
      .single();

    if (insertError || !plan) throw new Error("Não consegui salvar o plano gerado.");

    await context.supabase
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("id", context.userId);

    await context.supabase.from("credit_transactions").insert({
      user_id: context.userId,
      amount: -1,
      reason: "lesson_plan_generation",
    });

    return { id: plan.id as string };
  });
