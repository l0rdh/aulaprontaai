import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — AulaPronta IA" },
      { name: "description", content: "Acesse sua conta e continue seus planos de aula." },
      { property: "og:title", content: "Entrar — AulaPronta IA" },
      {
        property: "og:description",
        content: "Acesse sua conta e continue seus planos de aula.",
      },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(6, { message: "A senha precisa ter pelo menos 6 caracteres." }),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [enviandoReset, setEnviandoReset] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error("Não consegui entrar", { description: "E-mail ou senha incorretos." });
      return;
    }
    toast.success("Entrar", { description: "Bem-vindo(a) de volta!" });
    navigate({ to: "/dashboard" });
  }

  async function recuperarSenha() {
    const email = form.getValues("email").trim();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Informe seu e-mail no campo acima para redefinir a senha.");
      return;
    }
    setEnviandoReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setEnviandoReset(false);
    if (error) toast.error("Não consegui enviar o e-mail de recuperação.");
    else toast.success("E-mail enviado", { description: "Confira sua caixa de entrada." });
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seus planos de aula."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-primary hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={recuperarSenha}
          disabled={enviandoReset}
          className="text-xs font-medium text-primary hover:underline"
        >
          Esqueci minha senha
        </button>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
