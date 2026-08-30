import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  Printer,
  BarChart3,
  FileText,
  Target,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type ExamContent } from "@/lib/exam-generation.server";

export const Route = createFileRoute("/_authenticated/avaliacao/$id")({
  head: () => ({
    meta: [
      { title: "Avaliação — AulaPronta IA" },
      { name: "description", content: "Visualize sua avaliação completa com questões e gabarito." },
      { property: "og:title", content: "Avaliação — AulaPronta IA" },
      {
        property: "og:description",
        content: "Visualize sua avaliação completa com questões e gabarito.",
      },
    ],
  }),
  component: AvaliacaoPage,
});

function Secao({
  titulo,
  icon: Icon,
  children,
}: {
  titulo: string;
  icon: typeof Target;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <Icon className="h-4 w-4" aria-hidden />
        {titulo}
      </h2>
      <div className="mt-3 text-sm text-foreground">{children}</div>
    </section>
  );
}

function AvaliacaoPage() {
  const { id } = Route.useParams();

  const avaliacao = useQuery({
    queryKey: ["avaliacao", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_exams")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (avaliacao.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!avaliacao.data) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Avaliação não encontrada</h1>
        <Button className="mt-5" asChild>
          <Link to="/dashboard">Voltar para dashboard</Link>
        </Button>
      </div>
    );
  }

  const content = avaliacao.data.content_json as unknown as ExamContent;

  async function copiar() {
    const texto = [
      content.title,
      "",
      content.description,
      "",
      "INSTRUÇÕES:",
      content.instructions,
      "",
      "QUESTÕES:",
      ...content.questions.map(
        (q) =>
          `${q.number}. (${q.type}) ${q.question}\n${
            q.alternatives
              ? "Alternativas: " + q.alternatives.join(" / ")
              : "Resposta esperada: " + q.expectedAnswer
          }`
      ),
      "",
      "GABARITO:",
      ...content.questions.map(
        (q) => `${q.number}. ${q.expectedAnswer}`
      ),
    ].join("\n");

    await navigator.clipboard.writeText(texto);
    toast.success("Avaliação copiada para a área de transferência");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Dashboard
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{content.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{content.difficulty}</Badge>
            <Badge variant="secondary">{content.questions.length} questões</Badge>
            <Badge variant="secondary">{content.duration}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{content.description}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={copiar}>
            <Copy aria-hidden />
            Copiar
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden />
            Imprimir
          </Button>
        </div>
      </header>

      <Secao titulo="Instruções" icon={FileText}>
        <p className="text-muted-foreground whitespace-pre-line">{content.instructions}</p>
      </Secao>

      <Secao titulo="Questões" icon={ClipboardList}>
        <div className="space-y-6">
          {content.questions.map((questao, idx) => (
            <div
              key={questao.number}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex-1 font-semibold text-ink">
                  {questao.number}. {questao.question}
                </h3>
                <Badge variant="outline" className="shrink-0">
                  {questao.type}
                </Badge>
              </div>

              {questao.context && (
                <div className="mt-2 text-sm text-muted-foreground italic">
                  {questao.context}
                </div>
              )}

              {questao.alternatives && questao.alternatives.length > 0 && (
                <div className="mt-3 space-y-2">
                  {questao.alternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border bg-muted/40 p-2 text-sm"
                    >
                      {String.fromCharCode(97 + i)}) {alt}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 rounded-md bg-success/10 p-2 text-xs text-success">
                <p className="font-medium">Resposta esperada:</p>
                <p className="mt-1">{questao.expectedAnswer}</p>
              </div>

              {questao.criteria && questao.criteria.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Critérios de avaliação:</p>
                  <ul className="mt-1 space-y-1">
                    {questao.criteria.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Secao>

      {content.rubric && content.rubric.length > 0 && (
        <Secao titulo="Rubrica de avaliação" icon={BarChart3}>
          <div className="space-y-4">
            {content.rubric.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-background p-4">
                <h3 className="font-semibold text-ink">{item.criterion}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-success/30 bg-success/5 p-3">
                    <p className="text-xs font-semibold uppercase text-success">Excelente</p>
                    <p className="mt-1 text-xs text-foreground">{item.excellent}</p>
                  </div>
                  <div className="rounded-md border border-info/30 bg-info/5 p-3">
                    <p className="text-xs font-semibold uppercase text-info">Bom</p>
                    <p className="mt-1 text-xs text-foreground">{item.good}</p>
                  </div>
                  <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
                    <p className="text-xs font-semibold uppercase text-warning">Satisfatório</p>
                    <p className="mt-1 text-xs text-foreground">{item.satisfactory}</p>
                  </div>
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-semibold uppercase text-destructive">
                      Precisa melhorar
                    </p>
                    <p className="mt-1 text-xs text-foreground">{item.needsImprovement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {content.bnccCodes && content.bnccCodes.length > 0 && (
        <Secao titulo="Habilidades da BNCC" icon={Target}>
          <ul className="space-y-3">
            {content.bnccCodes.map((b) => (
              <li key={b.code} className="rounded-md border border-border bg-background p-3">
                <span className="font-mono text-xs font-semibold text-primary">{b.code}</span>
                <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      {content.notes && (
        <div className="flex gap-3 rounded-md border border-info/40 bg-info/10 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-info" aria-hidden />
          <p className="text-xs text-info">{content.notes}</p>
        </div>
      )}
    </div>
  );
}
