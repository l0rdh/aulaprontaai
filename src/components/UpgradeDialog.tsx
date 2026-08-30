import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startKiwifyCheckout } from "@/lib/kiwify-checkout.functions";

const FREE = [
  "3 créditos grátis ao criar a conta",
  "Planos alinhados à BNCC",
  "Cronograma completo da aula",
  "Sem cartão de crédito",
];

const PRO = [
  "Créditos ilimitados por mês",
  "Geração de avaliações a partir do plano",
  "Exportação em PDF pronta para imprimir",
  "Histórico completo e favoritos",
  "Suporte prioritário",
];

export function UpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [carregando, setCarregando] = useState(false);
  const iniciarCheckout = useServerFn(startKiwifyCheckout);

  async function handleUpgrade() {
    setCarregando(true);
    try {
      const { checkoutLink } = await iniciarCheckout({});
      // Redirecionar para checkout da Kiwify
      window.location.href = checkoutLink;
    } catch (error) {
      toast.error("Erro ao iniciar checkout", {
        description:
          error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      });
      setCarregando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Continue planejando sem limites
          </DialogTitle>
          <DialogDescription>
            Seus créditos grátis servem para experimentar. O plano Pro libera o uso no dia a dia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">Free</h3>
              <Badge variant="secondary">Atual</Badge>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">R$ 0</p>
            <ul className="mt-4 space-y-2">
              {FREE.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border-2 border-ink bg-accent/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">Pro</h3>
              <Badge className="bg-ink text-ink-foreground">Recomendado</Badge>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              R$ 19,90
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
            <ul className="mt-4 space-y-2">
              {PRO.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-5 w-full"
              onClick={handleUpgrade}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Redirecionando...
                </>
              ) : (
                <>
                  <Sparkles aria-hidden />
                  Assinar Pro
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
