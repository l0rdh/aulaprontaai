import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  ETAPAS,
  etapaLabel,
  type EtapaValue,
} from "@/lib/curriculo";
import { createExam } from "@/lib/exam-generation.functions";

export const Route = createFileRoute("/_authenticated/criar-avaliacao")({
  head: () => ({
    meta: [
      { title: "Criar avaliação — AulaPronta IA" },
      {
        name: "description",
        content: "Gere avaliações personalizadas alinhadas à BNCC em minutos.",
      },
      { property: "og:title", content: "Criar avaliação — AulaPronta IA" },
      {
        property: "og:description",
        content: "Gere avaliações personalizadas alinhadas à BNCC em minutos.",
      },
    ],
  }),
  component: CriarAvaliacaoPage,
});

const PASSOS = [
  "Etapa de ensino",
  "Ano / série",
  "Componente",
  "Tema da avaliação",
  "Dificuldade e quantidade",
];

const DIFICULDADES = [
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Média" },
  { value: "dificil", label: "Difícil" },
];

function CriarAvaliacaoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const gerar = useServerFn(createExam);

  const [passo, setPasso] = useState(0);
  const [etapa, setEtapa] = useState<EtapaValue | "">("");
  const [ano, setAno] = useState("");
  const [componente, setComponente] = useState("");
  const [tema, setTema] = useState("");
  const [dificuldade, setDificuldade] = useState("media");
  const [quantidade, setQuantidade] = useState("5");
  const [observacoes, setObservacoes] = useState("");
  const [gerando, setGerando] = useState(false);

  const noResumo = passo === 5;
  const podeAvancar =
    (passo === 0 && etapa) ||
    (passo === 1 && ano) ||
    (passo === 2 && componente) ||
    (passo === 3 && tema.trim().length >= 3) ||
    (passo === 4 && dificuldade && quantidade);

  async function gerarAvaliacao() {
    if (!user) return;
    if (profile?.plan !== "pro") {
      toast.error("Acesso restrito", {
        description: "Apenas membros Pro podem gerar avaliações.",
      });
      return;
    }

    setGerando(true);
    try {
      const { id } = await gerar({
        data: {
          etapa: etapaLabel(etapa),
          ano,
          componente,
          tema: tema.trim(),
          dificuldade,
          quantidade: Number(quantidade),
          observacoes: observacoes.trim() || undefined,
        },
      });

      await queryClient.invalidateQueries();
      toast.success("Avaliação pronta!", {
        description: "Gerada com IA e alinhada à BNCC.",
      });
      navigate({ to: "/avaliacao/$id", params: { id } });
    } catch (error) {
      toast.error("Erro ao gerar avaliação", {
        description:
          error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      });
      setGerando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => passo > 0 && setPasso(passo - 1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </button>

        <h1 className="font-display text-2xl font-semibold text-ink">
          Crie uma avaliação personalizada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {PASSOS[passo]} — Passo {passo + 1} de {PASSOS.length}
        </p>
      </div>

      <Progress value={((passo + 1) / PASSOS.length) * 100} className="h-1" />

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {passo === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="etapa" className="text-sm font-medium">
                Qual é a etapa de ensino?
              </Label>
              <Select value={etapa} onValueChange={(v) => setEtapa(v as EtapaValue)}>
                <SelectTrigger id="etapa" className="mt-2">
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
          </div>
        )}

        {passo === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ano" className="text-sm font-medium">
                Qual é o ano/série?
              </Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger id="ano" className="mt-2">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS[etapa as EtapaValue]?.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="componente" className="text-sm font-medium">
                Qual é a disciplina/componente?
              </Label>
              <Select value={componente} onValueChange={setComponente}>
                <SelectTrigger id="componente" className="mt-2">
                  <SelectValue placeholder="Selecione o componente" />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENTES[etapa as EtapaValue]?.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tema" className="text-sm font-medium">
                Qual é o tema da avaliação?
              </Label>
              <Textarea
                id="tema"
                placeholder="Ex: Operações com frações, Fotossíntese, Revolução Francesa..."
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="mt-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Seja específico para obter uma avaliação mais direcionada.
              </p>
            </div>
          </div>
        )}

        {passo === 4 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dificuldade" className="text-sm font-medium">
                  Nível de dificuldade
                </Label>
                <Select value={dificuldade} onValueChange={setDificuldade}>
                  <SelectTrigger id="dificuldade" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFICULDADES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantidade" className="text-sm font-medium">
                  Quantidade de questões
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="3"
                  max="20"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes" className="text-sm font-medium">
                Observações (opcional)
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: Incluir questões sobre alunos com deficiência auditiva, foco em pensamento crítico..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {noResumo && (
          <div className="space-y-4">
            <div className="rounded-lg bg-accent/40 p-4">
              <h3 className="font-semibold text-ink">Resumo da avaliação</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Etapa:</span>
                  <span className="font-medium text-foreground">{etapaLabel(etapa)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Ano/Série:</span>
                  <span className="font-medium text-foreground">{ano}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Componente:</span>
                  <span className="font-medium text-foreground">{componente}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Tema:</span>
                  <span className="font-medium text-foreground">{tema}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Dificuldade:</span>
                  <span className="font-medium text-foreground">
                    {DIFICULDADES.find((d) => d.value === dificuldade)?.label}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Questões:</span>
                  <span className="font-medium text-foreground">{quantidade}</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Clique abaixo para gerar sua avaliação com a IA. Isso leva alguns segundos.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {passo > 0 && (
          <Button
            variant="outline"
            onClick={() => setPasso(passo - 1)}
            disabled={gerando}
          >
            <ArrowLeft aria-hidden />
            Anterior
          </Button>
        )}

        {!noResumo ? (
          <Button
            onClick={() => setPasso(passo + 1)}
            disabled={!podeAvancar || gerando}
            className="flex-1"
          >
            Próximo
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <Button
            onClick={gerarAvaliacao}
            disabled={gerando}
            className="flex-1"
            size="lg"
          >
            {gerando ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles aria-hidden />
                Gerar avaliação
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
