-- Overages table to track usage beyond limits for billing
CREATE TABLE IF NOT EXISTS overages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enhancement', 'widget')),
  rate DECIMAL(10, 2) NOT NULL,
  billed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_overages_user_id ON overages(user_id);
CREATE INDEX IF NOT EXISTS idx_overages_billed ON overages(billed);

-- Usage alerts table to track which alerts have been sent
CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enhancement', 'widget')),
  threshold INTEGER NOT NULL CHECK (threshold IN (80, 100)),
  period_start DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, type, threshold, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_user_period ON usage_alerts(user_id, period_start);

-- RLS policies for overages
ALTER TABLE overages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overages"
  ON overages FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for usage_alerts
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage alerts"
  ON usage_alerts FOR SELECT
  USING (auth.uid() = user_id);
