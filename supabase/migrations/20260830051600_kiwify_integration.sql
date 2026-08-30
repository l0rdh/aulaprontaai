-- Create Kiwify transactions table
CREATE TABLE public.kiwify_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kiwify_order_id text NOT NULL UNIQUE,
  kiwify_customer_id text,
  amount integer NOT NULL, -- in cents
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'refused', 'completed', 'refunded')),
  product_id text NOT NULL,
  subscription_id text, -- for recurring subscriptions
  customer_email text NOT NULL,
  customer_name text,
  payment_method text, -- 'pix', 'credit_card', 'boleto', etc
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kiwify_transactions TO authenticated;
GRANT ALL ON public.kiwify_transactions TO service_role;

ALTER TABLE public.kiwify_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kiwify_transactions_select_own" ON public.kiwify_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "kiwify_transactions_insert_own" ON public.kiwify_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kiwify_service_role" ON public.kiwify_transactions FOR ALL TO service_role USING (true);

CREATE INDEX kiwify_transactions_user_created_idx ON public.kiwify_transactions (user_id, created_at DESC);
CREATE INDEX kiwify_transactions_order_id_idx ON public.kiwify_transactions (kiwify_order_id);
CREATE INDEX kiwify_transactions_status_idx ON public.kiwify_transactions (status);
