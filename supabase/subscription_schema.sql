-- ============================================
-- SUBSCRIPTION SYSTEM SCHEMA
-- muru.ai 구독 결제 시스템
-- ============================================

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,               -- 'basic', 'pro'
  name TEXT NOT NULL,                -- '기본', '프로'
  original_price INTEGER NOT NULL,   -- 정가
  price INTEGER NOT NULL,            -- 할인가
  template_limit INTEGER NOT NULL,   -- 템플릿 제한 개수
  ai_limit INTEGER,                  -- AI 사용량 제한 (NULL = 무제한)
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  billing_key TEXT,                  -- 토스페이먼츠 빌링키
  customer_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- AI USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,               -- '2025-12' 형식
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI usage" ON ai_usage
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TEMPLATE PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 9900,
  payment_key TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON template_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount INTEGER NOT NULL,
  payment_key TEXT,
  order_id TEXT UNIQUE NOT NULL,
  order_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- AUTO UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_updated_at
  BEFORE UPDATE ON ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- ============================================
-- INITIAL PLAN DATA
-- ============================================
INSERT INTO subscription_plans (id, name, original_price, price, template_limit, ai_limit, features)
VALUES
  ('basic', '기본', 24900, 15900, 3, 100, '["템플릿 3개 구독", "AI 생성 월 100회", "기본 지원"]'::jsonb),
  ('pro', '프로', 89000, 55000, 10, NULL, '["템플릿 10개 구독", "AI 생성 무제한", "우선 지원", "신규 템플릿 우선 접근"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
