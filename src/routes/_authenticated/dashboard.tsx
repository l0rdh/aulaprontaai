import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  PlusCircle,
  FileText,
  ClipboardList,
  BookMarked,
  CalendarClock,
  AlertTriangle,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AulaPronta IA" },
      { name: "description", content: "Seus créditos, estatísticas e planos recentes." },
      { property: "og:title", content: "Dashboard — AulaPronta IA" },
      {
        property: "og:description",
        content: "Seus créditos, estatísticas e planos recentes.",
      },
    ],
  }),
  component: DashboardPage,
});

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function DashboardPage() {
  const { user } = useSession();
  const { data: profile, isLoading: carregandoPerfil } = useProfile(user?.id);

  const planos = useQuery({
    queryKey: ["dashboard-planos", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_plans")
        .select("id, title, subject, grade_level, created_at, is_favorite")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const avaliacoes = useQuery({
    queryKey: ["dashboard-avaliacoes", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("generated_exams")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const avaliacoesList = useQuery({
    queryKey: ["dashboard-avaliacoes-list", user?.id],
    enabled: Boolean(user?.id) && profile?.plan === "pro",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_exams")
        .select("id, title, difficulty, question_count, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const lista = planos.data ?? [];
  const disciplinaTop =
    lista.length > 0
      ? Object.entries(
          lista.reduce<Record<string, number>>((acc, p) => {
            acc[p.subject] = (acc[p.subject] ?? 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
      : "—";

  const creditosBaixos = (profile?.credits ?? 0) <= 1;

  const stats = [
    { label: "Planos criados", value: String(lista.length), icon: FileText },
    { label: "Avaliações geradas", value: String(avaliacoes.data ?? 0), icon: ClipboardList },
    { label: "Disciplina mais usada", value: disciplinaTop, icon: BookMarked },
    {
      label: "Último plano",
      value: lista[0] ? formatarData(lista[0].created_at) : "—",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Olá, {profile?.full_name?.split(" ")[0] || "professor(a)"}
        </h1>
        <p className="text-sm text-muted-foreground">Seu planejamento em um lugar só.</p>
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        {carregandoPerfil ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-ink" aria-hidden />
                Créditos disponíveis
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-display text-5xl font-semibold text-ink tabular-nums">
                  {profile?.credits ?? 0}
                </span>
                <Badge variant={profile?.plan === "pro" ? "default" : "secondary"}>
                  Plano {profile?.plan === "pro" ? "Pro" : "Free"}
                </Badge>
              </div>
              {creditosBaixos && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  Seus créditos estão acabando — considere o plano Pro.
                </p>
              )}
            </div>

            <Button size="lg" asChild>
              <Link to="/criar-plano">
                <PlusCircle aria-hidden />
                Criar novo plano
              </Link>
            </Button>

            {profile?.plan === "pro" && (
              <Button size="lg" variant="outline" asChild>
                <Link to="/criar-avaliacao">
                  <Sparkles aria-hidden />
                  Criar avaliação
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <s.icon className="h-4 w-4 text-ink" aria-hidden />
            {planos.isLoading ? (
              <Skeleton className="mt-3 h-6 w-16" />
            ) : (
              <p className="mt-3 truncate text-xl font-semibold text-foreground">{s.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Planos recentes</h2>
          <Link to="/meus-planos" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>

        {planos.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <NotebookPen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">
              Seu caderno ainda está em branco
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie seu primeiro plano de aula em menos de 2 minutos.
            </p>
            <Button className="mt-5" asChild>
              <Link to="/criar-plano">
                <PlusCircle aria-hidden />
                Criar meu primeiro plano
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {lista.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  to="/plano/$id"
                  params={{ id: p.id }}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-ink/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{p.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.subject} · {p.grade_level} · {formatarData(p.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary">{p.subject}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {profile?.plan === "pro" && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Avaliações recentes</h2>
            <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>

          {avaliacoesList.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : !avaliacoesList.data || avaliacoesList.data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                Você ainda não criou avaliações
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere suas primeiras avaliações personalizadas com IA.
              </p>
              <Button className="mt-5" asChild>
                <Link to="/criar-avaliacao">
                  <Sparkles aria-hidden />
                  Criar minha primeira avaliação
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {avaliacoesList.data.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    to="/avaliacao/$id"
                    params={{ id: a.id }}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-ink/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{a.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.question_count} questões · {a.difficulty} · {formatarData(a.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">{a.difficulty}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
