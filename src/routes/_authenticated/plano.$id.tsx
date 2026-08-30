import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Printer, Target, Package, ClipboardCheck, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonSchedule } from "@/components/LessonSchedule";
import { planToPlainText, type LessonContent } from "@/lib/plan-content";

export const Route = createFileRoute("/_authenticated/plano/$id")({
  head: () => ({
    meta: [
      { title: "Plano de aula — AulaPronta IA" },
      { name: "description", content: "Visualize o plano completo com cronograma e BNCC." },
      { property: "og:title", content: "Plano de aula — AulaPronta IA" },
      {
        property: "og:description",
        content: "Visualize o plano completo com cronograma e BNCC.",
      },
    ],
  }),
  component: PlanoPage,
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

function PlanoPage() {
  const { id } = Route.useParams();

  const plano = useQuery({
    queryKey: ["plano", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (plano.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!plano.data) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Plano não encontrado</h1>
        <Button className="mt-5" asChild>
          <Link to="/meus-planos">Voltar para meus planos</Link>
        </Button>
      </div>
    );
  }

  const content = plano.data.content_json as unknown as LessonContent;

  async function copiar() {
    await navigator.clipboard.writeText(planToPlainText(content));
    toast.success("Plano copiado para a área de transferência");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="print:hidden">
        <Link
          to="/meus-planos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Meus planos
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{content.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{plano.data.subject}</Badge>
            <Badge variant="secondary">{plano.data.grade_level}</Badge>
            <Badge variant="secondary">{plano.data.duration_minutes} min</Badge>
          </div>
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

      <Secao titulo="Objetivos" icon={Target}>
        <p className="text-muted-foreground">{content.generalObjective}</p>
        <ul className="mt-3 space-y-1.5">
          {content.specificObjectives.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Habilidades da BNCC" icon={ClipboardCheck}>
        <ul className="space-y-3">
          {content.bnccCodes.map((b) => (
            <li key={b.code} className="rounded-md border border-border bg-background p-3">
              <span className="font-mono text-xs font-semibold text-primary">{b.code}</span>
              <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Materiais necessários" icon={Package}>
        <ul className="flex flex-wrap gap-2">
          {content.materials.map((m) => (
            <li key={m} className="rounded-md bg-muted px-2.5 py-1 text-xs text-foreground">
              {m}
            </li>
          ))}
        </ul>
      </Secao>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Cronograma da aula</h2>
        <div className="mt-4">
          <LessonSchedule schedule={content.schedule} />
        </div>
      </section>

      <Secao titulo="Avaliação" icon={ClipboardCheck}>
        <p className="font-medium text-ink">{content.assessment.type}</p>
        <p className="mt-1 text-muted-foreground">{content.assessment.description}</p>
        <ul className="mt-3 space-y-1.5">
          {content.assessment.criteria.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </Secao>

      {content.homework && (
        <Secao titulo="Tarefa de casa" icon={Home}>
          <p className="text-muted-foreground">{content.homework}</p>
        </Secao>
      )}

      {content.notes && (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          {content.notes}
        </p>
      )}

      {content.inclusionNotes && (
        <Secao titulo="Adaptações e inclusão" icon={ClipboardCheck}>
          <p className="text-muted-foreground">{content.inclusionNotes}</p>
        </Secao>
      )}
    </div>
  );
}
