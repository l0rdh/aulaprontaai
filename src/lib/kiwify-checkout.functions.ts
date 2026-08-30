import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateKiwifyCheckoutLink } from "@/integrations/kiwify/kiwify";

const startCheckoutSchema = z.object({
  // Você vai preencher isso com seu productId da Kiwify
});

export const startKiwifyCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { user, supabase } = context;

    // Buscar dados do perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("Perfil do usuário não encontrado");
    }

    // Configuração do produto Kiwify (você vai preencher com seus dados)
    const KIWIFY_PRODUCT_ID = process.env["KIWIFY_PRODUCT_ID"] || "seu-id-do-produto";
    const redirectUrl = `${process.env["APP_URL"] || "http://localhost:5173"}/dashboard`;

    // Registrar transação pendente
    const { data: transaction, error: transactionError } = await supabase
      .from("kiwify_transactions")
      .insert({
        user_id: user.id,
        kiwify_order_id: `pending-${Date.now()}-${user.id.slice(0, 8)}`,
        customer_email: profile.email,
        customer_name: profile.full_name,
        amount: 1990, // R$ 19,90 em centavos
        status: "pending",
        product_id: KIWIFY_PRODUCT_ID,
        metadata: { source: "checkout_iniciado" },
      })
      .select("id")
      .single();

    if (transactionError) {
      throw new Error("Não consegui registrar a transação");
    }

    // Gerar link de checkout
    const checkoutLink = generateKiwifyCheckoutLink({
      productId: KIWIFY_PRODUCT_ID,
      customerId: user.id,
      customerEmail: profile.email,
      customerName: profile.full_name || "Professor",
      externalOrderId: transaction.id,
      redirectUrl,
    });

    return { checkoutLink };
  });
