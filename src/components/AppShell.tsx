import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/criar-plano", label: "Criar Plano", icon: PlusCircle },
  { to: "/meus-planos", label: "Meus Planos", icon: FolderOpen },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function iniciais(nome?: string | null, email?: string | null) {
  const base = nome?.trim() || email?.split("@")[0] || "P";
  return base
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-4">
          <Link to="/dashboard" aria-label="Ir para o dashboard">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const ativo = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  ativo
                    ? "bg-accent text-ink"
                    : "text-muted-foreground hover:bg-secondary hover:text-ink",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" aria-hidden />
                {item.label}
              </Link>
            );
          })}

          <Button
            variant="outline"
            className="mt-4 w-full justify-start"
            onClick={() => setUpgradeOpen(true)}
          >
            <Sparkles aria-hidden />
            Fazer upgrade
          </Button>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-accent text-xs font-semibold text-ink">
                {iniciais(profile?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {profile?.full_name || "Professor(a)"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={sair} aria-label="Sair da conta">
              <LogOut aria-hidden />
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link to="/dashboard" aria-label="Ir para o dashboard">
          <Logo />
        </Link>
        <Button variant="ghost" size="icon" onClick={sair} aria-label="Sair da conta">
          <LogOut aria-hidden />
        </Button>
      </header>

      <main className="px-4 pb-24 pt-5 md:ml-64 md:px-8 md:pb-12 md:pt-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {NAV.map((item) => {
          const ativo = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                ativo ? "text-ink" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
