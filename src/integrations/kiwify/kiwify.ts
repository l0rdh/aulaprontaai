/**
 * Kiwify Integration
 * Documentação: https://kiwify.gitbook.io/kiwify/
 */

export type KiwifyOrderStatus = 'pending' | 'approved' | 'refused' | 'completed' | 'refunded';

export type KiwifyWebhookEvent = {
  id: string;
  type: 'order.created' | 'order.updated' | 'order.payment_received' | 'order.payment_confirmed' | 'order.refunded';
  timestamp: string;
  data: {
    order_id: string;
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    amount?: number;
    status?: KiwifyOrderStatus;
    payment_method?: string;
    product_id?: string;
    subscription_id?: string;
    [key: string]: any;
  };
};

/**
 * Obtém token de acesso da API Kiwify
 */
async function getKiwifyAccessToken(): Promise<string> {
  const clientId = process.env["KIWIFY_CLIENT_ID"];
  const clientSecret = process.env["KIWIFY_CLIENT_SECRET"];

  if (!clientId || !clientSecret) {
    throw new Error("Kiwify credentials not configured");
  }

  const response = await fetch("https://api.kiwify.com.br/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Kiwify access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Valida a assinatura do webhook usando o secret key
 */
export function validateKiwifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Kiwify usa HMAC SHA256 para assinar webhooks
  // signature = base64(hmac_sha256(secret, payload))
  
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  
  return hash === signature;
}

/**
 * Gera um link de checkout na Kiwify
 * Documentação: https://kiwify.gitbook.io/kiwify/
 */
export function generateKiwifyCheckoutLink(options: {
  productId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  externalOrderId?: string;
  redirectUrl?: string;
}): string {
  // Formato: https://kiwify.com.br/{account_id}/checkout/{product_id}
  const accountId = process.env["KIWIFY_ACCOUNT_ID"] || "seu-account-id";
  
  const baseUrl = `https://kiwify.com.br/${accountId}/checkout/${options.productId}`;
  
  const params = new URLSearchParams();
  params.append('customer_email', options.customerEmail);
  params.append('customer_name', options.customerName);
  
  if (options.customerId) {
    params.append('customer_id', options.customerId);
  }
  
  if (options.externalOrderId) {
    params.append('external_order_id', options.externalOrderId);
  }
  
  if (options.redirectUrl) {
    params.append('redirect_url', options.redirectUrl);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Verifica o status de um pedido na Kiwify (requer API key)
 */
export async function checkKiwifyOrderStatus(
  orderId: string,
  apiKey: string
): Promise<{
  order_id: string;
  status: KiwifyOrderStatus;
  customer_email: string;
  amount: number;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}> {
  const token = await getKiwifyAccessToken();
  
  const response = await fetch(`https://api.kiwify.com.br/v1/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Kiwify API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Refunda um pedido (requer API key)
 */
export async function refundKiwifyOrder(
  orderId: string,
  apiKey: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const token = await getKiwifyAccessToken();
  
  const response = await fetch(`https://api.kiwify.com.br/v1/orders/${orderId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error(`Kiwify API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Processa webhook de pagamento aprovado
 */
export async function handleKiwifyPaymentApproved(
  event: KiwifyWebhookEvent,
  supabaseClient: any
): Promise<{ success: boolean; message: string }> {
  const { order_id, customer_email, amount, status } = event.data;

  if (status !== 'approved' && status !== 'completed') {
    return { success: false, message: 'Order status is not approved or completed' };
  }

  // Buscar usuário pelo email
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('email', customer_email)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, message: 'User not found' };
  }

  // Atualizar plano para "pro"
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ 
      plan: 'pro',
      credits: 999999, // créditos infinitos para Pro
    })
    .eq('id', profile.id);

  if (updateError) {
    return { success: false, message: 'Failed to update user plan' };
  }

  // Registrar transação
  const { error: transactionError } = await supabaseClient
    .from('kiwify_transactions')
    .insert({
      user_id: profile.id,
      kiwify_order_id: order_id,
      customer_email,
      amount,
      status: 'approved',
      payment_method: event.data.payment_method || 'unknown',
      metadata: event.data,
    });

  if (transactionError) {
    console.error('Failed to log transaction:', transactionError);
  }

  return { 
    success: true, 
    message: `User ${profile.id} upgraded to Pro plan` 
  };
}

export { getKiwifyAccessToken };
