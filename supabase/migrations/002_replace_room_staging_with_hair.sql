-- Migration: Replace room_staging template with hair template
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing check constraint on template
ALTER TABLE widgets DROP CONSTRAINT IF EXISTS widgets_template_check;

-- Step 2: Update any existing room_staging widgets to hair (if any)
UPDATE widgets SET template = 'hair' WHERE template = 'room_staging';

-- Step 3: Add the new check constraint with 'hair' instead of 'room_staging'
ALTER TABLE widgets ADD CONSTRAINT widgets_template_check
  CHECK (template IN ('smile', 'hair', 'kitchen_remodel', 'landscaping'));
