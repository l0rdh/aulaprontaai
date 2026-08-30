CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  school_name text,
  subjects_taught text[] NOT NULL DEFAULT '{}',
  credits integer NOT NULL DEFAULT 3,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  grade_level text NOT NULL,
  subject text NOT NULL,
  theme text NOT NULL,
  bncc_codes text[] NOT NULL DEFAULT '{}',
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_minutes integer NOT NULL DEFAULT 50,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO authenticated;
GRANT ALL ON public.lesson_plans TO service_role;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_plans_all_own" ON public.lesson_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX lesson_plans_user_created_idx ON public.lesson_plans (user_id, created_at DESC);

CREATE TABLE public.generated_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_plan_id uuid REFERENCES public.lesson_plans(id) ON DELETE SET NULL,
  title text NOT NULL,
  question_count integer NOT NULL DEFAULT 10,
  difficulty text NOT NULL DEFAULT 'media',
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_exams TO authenticated;
GRANT ALL ON public.generated_exams TO service_role;
ALTER TABLE public.generated_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generated_exams_all_own" ON public.generated_exams FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "credit_transactions_insert_own" ON public.credit_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, credits, plan)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, 3, 'free')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.credit_transactions (user_id, amount, reason)
  VALUES (NEW.id, 3, 'Créditos de boas-vindas');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();