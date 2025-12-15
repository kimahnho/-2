-- Add preview_elements column to projects table
-- Run this in Supabase SQL Editor

ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_elements JSONB;
