export type KiwifyTransaction = {
  id: string;
  user_id: string;
  kiwify_order_id: string;
  kiwify_customer_id: string | null;
  amount: number; // in cents
  status: "pending" | "approved" | "refused" | "completed" | "refunded";
  product_id: string;
  subscription_id: string | null;
  customer_email: string;
  customer_name: string | null;
  payment_method: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

export type KiwifyCheckoutSession = {
  checkoutLink: string;
  expiresIn?: number; // seconds
};

export const KIWIFY_ORDER_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REFUSED: "refused",
  COMPLETED: "completed",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  boleto: "Boleto Bancário",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
  bank_transfer: "Transferência Bancária",
} as const;
