-- Add cost field to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);
