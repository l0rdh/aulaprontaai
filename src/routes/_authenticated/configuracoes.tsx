import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ETAPAS } from "@/lib/curriculo";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — AulaPronta IA" },
      { name: "description", content: "Atualize seus dados de professor e seu plano." },
      { property: "og:title", content: "Configurações — AulaPronta IA" },
      {
        property: "og:description",
        content: "Atualize seus dados de professor e seu plano.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

const perfilSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo")
    .max(100, "Máximo de 100 caracteres"),
  school: z.string().trim().max(120, "Máximo de 120 caracteres"),
});

function ConfiguracoesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);

  const [nome, setNome] = useState("");
  const [escola, setEscola] = useState("");
  const [etapa, setEtapa] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNome(profile.full_name ?? "");
    setEscola(profile.school_name ?? "");
    setEtapa(profile.subjects_taught?.[0] ?? "");
  }, [profile]);

  async function salvar() {
    const parsed = perfilSchema.safeParse({ full_name: nome, school: escola });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    if (!user) return;

    setSalvando(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        school_name: parsed.data.school || null,
        subjects_taught: etapa ? [etapa] : [],
      })
      .eq("id", user.id);
    setSalvando(false);

    if (error) {
      toast.error("Não consegui salvar as alterações");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Dados atualizados");
  }

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Configurações</h1>
        <p className="text-sm text-muted-foreground">Seus dados e seu plano.</p>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Perfil</h2>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" value={user?.email ?? ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" value={nome} maxLength={100} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="escola">Escola</Label>
          <Input
            id="escola"
            value={escola}
            maxLength={120}
            onChange={(e) => setEscola(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="space-y-2">
          <Label>Etapa em que leciona</Label>
          <Select value={etapa} onValueChange={setEtapa}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
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

        <Button onClick={salvar} disabled={salvando}>
          <Save aria-hidden />
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Seu plano</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={profile?.plan === "pro" ? "default" : "secondary"}>
              {profile?.plan === "pro" ? "Pro" : "Free"}
            </Badge>
            {profile?.credits ?? 0} créditos restantes
          </div>
        </div>
        {profile?.plan !== "pro" && (
          <Button onClick={() => setUpgradeOpen(true)}>
            <Sparkles aria-hidden />
            Fazer upgrade
          </Button>
        )}
      </section>

      <Button variant="outline" onClick={sair}>
        <LogOut aria-hidden />
        Sair da conta
      </Button>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
