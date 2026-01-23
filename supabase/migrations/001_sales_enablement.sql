-- Sales Enablement Migration
-- Adds consultations table and sales tool columns to widgets

-- Add sales tool columns to widgets table
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS sales_tool_enabled BOOLEAN DEFAULT false;
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS business_website TEXT;
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS business_tagline TEXT;

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,                    -- e.g., 'cons_abc123xyz'
  widget_id TEXT REFERENCES widgets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Client info
  client_name TEXT,                       -- Optional, e.g., "Johnson Residence"
  client_email TEXT,                      -- Set when preview is sent

  -- Images
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT,

  -- Transformation details
  style_key TEXT,                         -- e.g., 'garden_oasis', 'balayage'
  style_label TEXT,                       -- e.g., 'Garden Oasis', 'Balayage'

  -- Optional quote
  quote_amount DECIMAL(10,2),

  -- Shareable link
  preview_id TEXT UNIQUE,                 -- e.g., 'p_xyz789' for /p/xyz789
  preview_views INTEGER DEFAULT 0,

  -- Message sent with email
  personal_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE        -- NULL if not yet sent
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_consultations_widget ON consultations(widget_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_preview ON consultations(preview_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);

-- Enable RLS on consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
-- Public access for sales tool (no auth) - read only by widget_id
CREATE POLICY "Anyone can view consultations by widget" ON consultations
  FOR SELECT USING (true);

-- Insert policy - allow from API (service role will be used)
CREATE POLICY "Service can insert consultations" ON consultations
  FOR INSERT WITH CHECK (true);

-- Update policy - allow from API (service role will be used)
CREATE POLICY "Service can update consultations" ON consultations
  FOR UPDATE USING (true);

-- Users can view their own consultations (dashboard)
CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (auth.uid() = user_id);
