import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Clock,
  ShieldCheck,
  FileText,
  PenLine,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LessonSchedule } from "@/components/LessonSchedule";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AulaPronta IA — Planos de aula alinhados à BNCC em minutos" },
      {
        name: "description",
        content:
          "Crie planos de aula e avaliações alinhados à BNCC em menos de 2 minutos. Feito para professores da Educação Básica brasileira.",
      },
      { property: "og:title", content: "AulaPronta IA — Planos de aula alinhados à BNCC" },
      {
        property: "og:description",
        content:
          "Crie planos de aula e avaliações alinhados à BNCC em menos de 2 minutos. Feito para professores brasileiros.",
      },
    ],
  }),
  component: LandingPage,
});

const DEMO = [
  {
    stage: "Acolhida",
    durationMinutes: 5,
    description: "Retomada do combinado da turma e pergunta disparadora sobre o tema.",
    teacherAction: "Registrar hipóteses dos estudantes no quadro.",
  },
  {
    stage: "Desenvolvimento",
    durationMinutes: 25,
    description: "Exploração guiada com material concreto e resolução em duplas.",
    teacherAction: "Circular pela sala mediando as duplas.",
  },
  {
    stage: "Sistematização",
    durationMinutes: 15,
    description: "Socialização das estratégias e formalização do conceito no caderno.",
    teacherAction: "Organizar a síntese coletiva.",
  },
  {
    stage: "Fechamento",
    durationMinutes: 5,
    description: "Autoavaliação rápida com ficha de saída.",
    teacherAction: "Recolher as fichas para acompanhar a turma.",
  },
];

const PASSOS = [
  {
    icon: PenLine,
    titulo: "Você informa o contexto",
    texto: "Etapa, ano, componente e o tema da aula. Leva menos de um minuto.",
  },
  {
    icon: Wand2,
    titulo: "A IA monta o plano",
    texto: "Objetivos, habilidades da BNCC, cronograma minuto a minuto e avaliação.",
  },
  {
    icon: FileText,
    titulo: "Você usa em sala",
    texto: "Copie, imprima ou ajuste. Tudo fica salvo na sua conta.",
  },
];

const BENEFICIOS = [
  { icon: Clock, titulo: "2 minutos por plano", texto: "Em vez de duas horas no fim de semana." },
  {
    icon: ShieldCheck,
    titulo: "Alinhado à BNCC",
    texto: "Habilidades e códigos sugeridos para cada aula.",
  },
  {
    icon: Sparkles,
    titulo: "Pronto para a sua turma",
    texto: "Adaptações de inclusão e observações do seu contexto.",
  },
];

const FAQ = [
  {
    q: "Os planos seguem mesmo a BNCC?",
    a: "Sim. Cada plano traz habilidades e códigos sugeridos para a etapa e o componente escolhidos. Você revisa e ajusta o que quiser antes de usar.",
  },
  {
    q: "Preciso pagar para testar?",
    a: "Não. Ao criar sua conta você recebe 3 créditos gratuitos para gerar planos completos.",
  },
  {
    q: "Posso editar o plano depois?",
    a: "Pode. O plano fica salvo na sua conta e pode ser copiado, impresso e adaptado quantas vezes precisar.",
  },
  {
    q: "Serve para a Educação Infantil?",
    a: "Sim. A plataforma cobre Educação Infantil, Anos Iniciais, Anos Finais e Ensino Médio.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Criar conta grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Feito para professores da Educação Básica
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
              Seu plano de aula pronto antes do café esfriar
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              O AulaPronta IA cria planos de aula e avaliações alinhados à BNCC em menos de dois
              minutos — com cronograma, objetivos e critérios de avaliação prontos para a sua turma.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/cadastro">Criar meu primeiro plano</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />3 planos gratuitos ao criar a
              conta
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Exemplo de cronograma
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-ink">
              Frações equivalentes · 5º ano · 50 min
            </h2>
            <div className="mt-5">
              <LessonSchedule schedule={DEMO} />
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center font-display text-3xl font-semibold text-ink">
              Como funciona
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {PASSOS.map((p, i) => (
                <div key={p.titulo} className="rounded-lg border border-border bg-background p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p.icon className="h-4 w-4 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{p.titulo}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <b.icon className="h-5 w-5 text-ink" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{b.titulo}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <h2 className="text-center font-display text-3xl font-semibold text-ink">
              Perguntas frequentes
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left font-medium text-ink">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Devolva o seu domingo para você
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Comece agora com 3 planos gratuitos. Sem cartão de crédito.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/cadastro">Criar conta grátis</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} AulaPronta IA — feito para professores do Brasil.</p>
        </div>
      </footer>
    </div>
  );
}
