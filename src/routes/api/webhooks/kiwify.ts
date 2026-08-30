import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createClient } from "@supabase/supabase-js";
import { validateKiwifyWebhook, handleKiwifyPaymentApproved, type KiwifyWebhookEvent } from "@/integrations/kiwify/kiwify";

export const Route = createAPIFileRoute("/api/webhooks/kiwify")({
  POST: async ({ request }) => {
    try {
      // Obter configurações
      const KIWIFY_WEBHOOK_SECRET = process.env["KIWIFY_WEBHOOK_SECRET"];
      const SUPABASE_URL = process.env["SUPABASE_URL"];
      const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];

      if (!KIWIFY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return new Response(
          JSON.stringify({ error: "Missing environment variables" }),
          { status: 500 }
        );
      }

      // Ler o corpo da requisição
      const body = await request.text();
      const signature = request.headers.get("x-kiwify-signature");

      if (!signature) {
        return new Response(
          JSON.stringify({ error: "Missing signature header" }),
          { status: 401 }
        );
      }

      // Validar assinatura do webhook
      const isValid = validateKiwifyWebhook(body, signature, KIWIFY_WEBHOOK_SECRET);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401 }
        );
      }

      // Parsear evento
      const event: KiwifyWebhookEvent = JSON.parse(body);

      // Criar cliente Supabase com service role
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      // Processar evento baseado no tipo
      let result: { success: boolean; message: string };

      if (
        event.type === "order.payment_received" ||
        event.type === "order.payment_confirmed"
      ) {
        // Pagamento recebido/confirmado - atualizar plano do usuário
        result = await handleKiwifyPaymentApproved(event, supabase);
      } else if (event.type === "order.refunded") {
        // Reembolso - downgrade do plano
        const { customer_email } = event.data;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customer_email)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ 
              plan: "free",
              credits: 3, // volta aos créditos grátis
            })
            .eq("id", profile.id);

          result = { 
            success: true, 
            message: `User ${profile.id} downgraded from Pro plan due to refund` 
          };
        } else {
          result = { success: false, message: "User not found for refund" };
        }
      } else {
        // Ignorar outros tipos de evento por enquanto
        result = { success: true, message: `Event type ${event.type} ignored` };
      }

      // Log da transação processada
      if (result.success) {
        console.log(`[Kiwify Webhook] ✅ ${result.message}`);
      } else {
        console.error(`[Kiwify Webhook] ❌ ${result.message}`);
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("[Kiwify Webhook] Error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error)
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
