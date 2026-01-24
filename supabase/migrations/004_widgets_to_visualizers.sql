-- Migration: Rename widgets to visualizers
-- This migration transitions from "widgets" to "visualizers" terminology

-- Rename main widgets table to visualizers
ALTER TABLE IF EXISTS widgets RENAME TO visualizers;

-- Rename widget_usage table to consultation_usage
ALTER TABLE IF EXISTS widget_usage RENAME TO consultation_usage;

-- Rename widget_id columns
ALTER TABLE IF EXISTS consultation_usage RENAME COLUMN widget_id TO visualizer_id;
ALTER TABLE IF EXISTS consultations RENAME COLUMN widget_id TO visualizer_id;

-- Rename columns in usage table
ALTER TABLE IF EXISTS usage RENAME COLUMN widget_transform_count TO consultation_count;
ALTER TABLE IF EXISTS usage RENAME COLUMN widget_transform_limit TO consultation_limit;

-- Create demo_usage table for tracking demo credits
CREATE TABLE IF NOT EXISTS demo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create index for demo_usage lookups
CREATE INDEX IF NOT EXISTS idx_demo_usage_user_period ON demo_usage(user_id, period_start);

-- Enable RLS on demo_usage
ALTER TABLE demo_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_usage
CREATE POLICY "Users can view own demo usage" ON demo_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert demo usage" ON demo_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update demo usage" ON demo_usage
  FOR UPDATE USING (true);

-- Update RPC function: rename to increment_consultation_count
CREATE OR REPLACE FUNCTION increment_consultation_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS VOID AS $$
BEGIN
  UPDATE usage
  SET consultation_count = consultation_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function for incrementing demo usage
CREATE OR REPLACE FUNCTION increment_demo_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO demo_usage (user_id, period_start, credits_used)
  VALUES (p_user_id, p_period_start, 1)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    credits_used = demo_usage.credits_used + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep old function name as alias for backwards compatibility
CREATE OR REPLACE FUNCTION increment_widget_transform_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS VOID AS $$
BEGIN
  PERFORM increment_consultation_count(p_user_id, p_period_start);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
