-- RenderLab Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'agency')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  enhancement_count INTEGER DEFAULT 0,
  widget_transform_count INTEGER DEFAULT 0,
  enhancement_limit INTEGER NOT NULL DEFAULT 200,
  widget_transform_limit INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template TEXT NOT NULL CHECK (template IN ('smile', 'room_staging', 'kitchen_remodel', 'landscaping')),
  client_name TEXT NOT NULL,
  brand_color TEXT DEFAULT '#F59E0B',
  logo_url TEXT,
  cta_text TEXT DEFAULT 'See Your Transformation',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget usage tracking
CREATE TABLE IF NOT EXISTS widget_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id TEXT REFERENCES widgets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transformed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhancement usage tracking
CREATE TABLE IF NOT EXISTS enhancement_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enhancement_type TEXT NOT NULL,
  transformed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_status ON widgets(status);
CREATE INDEX IF NOT EXISTS idx_widget_usage_widget_id ON widget_usage(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_user_id ON widget_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_transformed_at ON widget_usage(transformed_at);
CREATE INDEX IF NOT EXISTS idx_enhancement_usage_user_id ON enhancement_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period_start);

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- Create default subscription (starter tier, trialing)
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'starter', 'trialing');

  -- Create usage record for current month
  INSERT INTO public.usage (
    user_id,
    period_start,
    period_end,
    enhancement_limit,
    widget_transform_limit
  )
  VALUES (
    NEW.id,
    DATE_TRUNC('month', NOW())::DATE,
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
    200,  -- starter tier limit
    50    -- starter tier limit
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment widget transform count
CREATE OR REPLACE FUNCTION increment_widget_transform_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS VOID AS $$
BEGIN
  UPDATE usage
  SET widget_transform_count = widget_transform_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment enhancement count
CREATE OR REPLACE FUNCTION increment_enhancement_count(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS VOID AS $$
BEGIN
  UPDATE usage
  SET enhancement_count = enhancement_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_usage ENABLE ROW LEVEL SECURITY;

-- Users: users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage: users can only see their own usage
CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- Widgets: users can CRUD their own widgets
CREATE POLICY "Users can view own widgets" ON widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create widgets" ON widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON widgets
  FOR DELETE USING (auth.uid() = user_id);

-- Widget usage: users can view usage for their widgets
CREATE POLICY "Users can view own widget usage" ON widget_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert widget usage" ON widget_usage
  FOR INSERT WITH CHECK (true);

-- Enhancement usage: users can view their own enhancement usage
CREATE POLICY "Users can view own enhancement usage" ON enhancement_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert enhancement usage" ON enhancement_usage
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
