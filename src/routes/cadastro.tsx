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

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — AulaPronta IA" },
      {
        name: "description",
        content: "Crie sua conta grátis e ganhe 3 créditos para gerar planos de aula.",
      },
      { property: "og:title", content: "Criar conta — AulaPronta IA" },
      {
        property: "og:description",
        content: "Crie sua conta grátis e ganhe 3 créditos para gerar planos de aula.",
      },
    ],
  }),
  component: CadastroPage,
});

const schema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, { message: "Informe seu nome completo." })
    .max(100, { message: "Nome muito longo." }),
  email: z.string().trim().email({ message: "Informe um e-mail válido." }).max(255),
  password: z.string().min(6, { message: "A senha precisa ter pelo menos 6 caracteres." }),
});

type FormValues = z.infer<typeof schema>;

function CadastroPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: values.full_name },
      },
    });

    if (error) {
      toast.error("Não consegui criar sua conta", {
        description: error.message.includes("already")
          ? "Este e-mail já está cadastrado."
          : "Tente novamente em instantes.",
      });
      return;
    }

    toast.success("Criar conta grátis", {
      description: "Conta criada! Você ganhou 3 créditos.",
    });
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title="Criar conta grátis"
      subtitle="3 créditos para testar, sem cartão de crédito."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" autoComplete="name" {...form.register("full_name")} />
          {form.formState.errors.full_name && (
            <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          Criar conta grátis
        </Button>
      </form>
    </AuthLayout>
  );
}
