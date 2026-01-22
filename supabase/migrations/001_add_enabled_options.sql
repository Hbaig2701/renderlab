-- Migration: Add enabled_options column to widgets table
-- Run this in Supabase SQL Editor if the column doesn't exist

-- Add enabled_options column to existing widgets table
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS enabled_options TEXT[] DEFAULT NULL;

-- Note: NULL means all options are enabled (default behavior)
-- When specific options are selected, the array will contain the keys like ['whitening', 'veneers']
