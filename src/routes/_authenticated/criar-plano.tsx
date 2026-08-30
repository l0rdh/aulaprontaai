import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANOS,
  COMPONENTES,
  DURACOES,
  ETAPAS,
  etapaLabel,
  type EtapaValue,
} from "@/lib/curriculo";
import { buildMockPlan } from "@/lib/plan-content";

export const Route = createFileRoute("/_authenticated/criar-plano")({
  head: () => ({
    meta: [
      { title: "Criar plano de aula — AulaPronta IA" },
      {
        name: "description",
        content: "Monte seu plano em 4 passos: etapa, ano, componente e tema da aula.",
      },
      { property: "og:title", content: "Criar plano de aula — AulaPronta IA" },
      {
        property: "og:description",
        content: "Monte seu plano em 4 passos: etapa, ano, componente e tema da aula.",
      },
    ],
  }),
  component: CriarPlanoPage,
});

const PASSOS = ["Etapa de ensino", "Ano / série", "Componente", "Detalhes da aula"];

function CriarPlanoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);

  const [passo, setPasso] = useState(0);
  const [etapa, setEtapa] = useState<EtapaValue | "">("");
  const [ano, setAno] = useState("");
  const [componente, setComponente] = useState("");
  const [tema, setTema] = useState("");
  const [duracao, setDuracao] = useState("50");
  const [observacoes, setObservacoes] = useState("");
  const [gerando, setGerando] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const noResumo = passo === 4;
  const podeAvancar =
    (passo === 0 && etapa) ||
    (passo === 1 && ano) ||
    (passo === 2 && componente) ||
    (passo === 3 && tema.trim().length >= 3);

  async function gerarPlano() {
    if (!user) return;
    if ((profile?.credits ?? 0) <= 0) {
      setUpgradeOpen(true);
      return;
    }

    setGerando(true);
    await new Promise((r) => setTimeout(r, 2000));

    const content = buildMockPlan({
      etapa: etapa as string,
      ano,
      componente,
      tema: tema.trim(),
      duracao: Number(duracao),
      observacoes,
    });

    const { data, error } = await supabase
      .from("lesson_plans")
      .insert({
        user_id: user.id,
        title: content.title,
        grade_level: ano,
        subject: componente,
        theme: tema.trim(),
        bncc_codes: content.bnccCodes.map((b) => b.code),
        content_json: content as unknown as Record<string, unknown>,
        duration_minutes: Number(duracao),
      })
      .select("id")
      .single();

    setGerando(false);

    if (error || !data) {
      toast.error("Não consegui gerar o plano", { description: "Tente novamente em instantes." });
      return;
    }

    await queryClient.invalidateQueries();
    toast.success("Gerar Plano de Aula", { description: "Seu plano está pronto." });
    navigate({ to: "/plano/$id", params: { id: data.id } });
  }

  if (gerando) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">
          Criando seu plano de aula...
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estruturando objetivos, cronograma e habilidades da BNCC.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Criar plano de aula</h1>
      <p className="text-sm text-muted-foreground">
        {noResumo ? "Confira o resumo antes de gerar." : `Passo ${passo + 1} de 4 · ${PASSOS[passo]}`}
      </p>

      <Progress value={((passo + 1) / 5) * 100} className="mt-4 h-1.5" />

      <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="animate-in fade-in duration-200">
          {passo === 0 && (
            <div className="space-y-2">
              <Label>Qual é a etapa de ensino?</Label>
              <Select
                value={etapa}
                onValueChange={(v) => {
                  setEtapa(v as EtapaValue);
                  setAno("");
                  setComponente("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {ETAPAS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {passo === 1 && etapa && (
            <div className="space-y-2">
              <Label>Qual ano ou série?</Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano/série" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS[etapa].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {passo === 2 && etapa && (
            <div className="space-y-2">
              <Label>
                {etapa === "educacao-infantil" ? "Campo de experiência" : "Componente / área"}
              </Label>
              <Select value={componente} onValueChange={setComponente}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENTES[etapa].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema da aula</Label>
                <Input
                  id="tema"
                  value={tema}
                  maxLength={140}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex.: Frações equivalentes"
                />
              </div>

              <div className="space-y-2">
                <Label>Duração da aula</Label>
                <Select value={duracao} onValueChange={setDuracao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACOES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações (opcional)</Label>
                <Textarea
                  id="obs"
                  value={observacoes}
                  maxLength={500}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex.: turma agitada, aluno com deficiência auditiva, sala com projetor"
                />
              </div>
            </div>
          )}

          {noResumo && (
            <dl className="space-y-3">
              {[
                ["Etapa de ensino", etapaLabel(etapa)],
                ["Ano / série", ano],
                ["Componente", componente],
                ["Tema", tema],
                ["Duração", `${duracao} minutos`],
                ["Observações", observacoes || "—"],
              ].map(([rotulo, valor]) => (
                <div
                  key={rotulo}
                  className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6"
                >
                  <dt className="text-sm text-muted-foreground">{rotulo}</dt>
                  <dd className="text-sm font-medium text-ink sm:text-right">{valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
          >
            <ArrowLeft aria-hidden />
            Voltar
          </Button>

          {noResumo ? (
            <Button size="lg" onClick={gerarPlano}>
              <Sparkles aria-hidden />
              Gerar Plano de Aula
            </Button>
          ) : (
            <Button onClick={() => setPasso((p) => p + 1)} disabled={!podeAvancar}>
              {passo === 3 ? <Check aria-hidden /> : null}
              {passo === 3 ? "Revisar" : "Continuar"}
              {passo === 3 ? null : <ArrowRight aria-hidden />}
            </Button>
          )}
        </div>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
