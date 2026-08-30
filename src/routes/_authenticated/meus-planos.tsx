import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, NotebookPen, PlusCircle, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TODOS_COMPONENTES } from "@/lib/curriculo";

export const Route = createFileRoute("/_authenticated/meus-planos")({
  head: () => ({
    meta: [
      { title: "Meus planos — AulaPronta IA" },
      { name: "description", content: "Busque, favorite e organize seus planos de aula." },
      { property: "og:title", content: "Meus planos — AulaPronta IA" },
      {
        property: "og:description",
        content: "Busque, favorite e organize seus planos de aula.",
      },
    ],
  }),
  component: MeusPlanosPage,
});

function MeusPlanosPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const planos = useQuery({
    queryKey: ["planos", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_plans")
        .select("id, title, subject, grade_level, theme, created_at, is_favorite")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function alternarFavorito(id: string, atual: boolean) {
    const { error } = await supabase
      .from("lesson_plans")
      .update({ is_favorite: !atual })
      .eq("id", id);
    if (error) {
      toast.error("Não consegui atualizar o favorito");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["planos"] });
  }

  async function excluir(id: string) {
    const { error } = await supabase.from("lesson_plans").delete().eq("id", id);
    if (error) {
      toast.error("Não consegui excluir o plano");
      return;
    }
    toast.success("Plano excluído");
    await queryClient.invalidateQueries();
  }

  const termo = busca.trim().toLowerCase();
  const lista = (planos.data ?? []).filter((p) => {
    const casaBusca =
      !termo ||
      p.title.toLowerCase().includes(termo) ||
      (p.theme ?? "").toLowerCase().includes(termo);
    const casaFiltro =
      filtro === "todos" ||
      (filtro === "favoritos" ? p.is_favorite : p.subject === filtro);
    return casaBusca && casaFiltro;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Meus planos</h1>
          <p className="text-sm text-muted-foreground">Tudo o que você já criou.</p>
        </div>
        <Button asChild>
          <Link to="/criar-plano">
            <PlusCircle aria-hidden />
            Novo plano
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={busca}
            maxLength={100}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou tema"
            className="pl-9"
            aria-label="Buscar planos"
          />
        </div>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="favoritos">Favoritos</SelectItem>
            {TODOS_COMPONENTES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {planos.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <NotebookPen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <h2 className="mt-3 font-display text-lg font-semibold text-ink">
            Nenhum plano por aqui
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste a busca ou crie um plano novo.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((p) => (
            <li
              key={p.id}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-ink/40"
            >
              <Link to="/plano/$id" params={{ id: p.id }} className="block">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-ink">{p.title}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {p.grade_level}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.subject} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>

              <div className="mt-4 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={p.is_favorite ? "Remover dos favoritos" : "Favoritar plano"}
                  onClick={() => alternarFavorito(p.id, Boolean(p.is_favorite))}
                >
                  <Star
                    aria-hidden
                    className={p.is_favorite ? "fill-current text-warning" : undefined}
                  />
                  Favorito
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Excluir plano"
                  onClick={() => excluir(p.id)}
                >
                  <Trash2 aria-hidden />
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
