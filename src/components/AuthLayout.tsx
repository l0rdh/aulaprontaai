import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link to="/" aria-label="Voltar para a página inicial">
        <Logo />
      </Link>

      <div className="mt-6 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>

      <div className="mt-5 text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}
