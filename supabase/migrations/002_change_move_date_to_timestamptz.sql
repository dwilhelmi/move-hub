-- Migration 002: Change all DATE fields to TIMESTAMPTZ to preserve time components
-- This fixes the issue where dates lose their time component and appear a day earlier

-- ============================================================================
-- Change move_details columns
-- ============================================================================

-- Convert move_date from DATE to TIMESTAMPTZ
ALTER TABLE move_details 
  ALTER COLUMN move_date TYPE TIMESTAMPTZ 
  USING (move_date::text || ' 12:00:00+00')::timestamptz;

-- Convert created_date from DATE to TIMESTAMPTZ
ALTER TABLE move_details 
  ALTER COLUMN created_date TYPE TIMESTAMPTZ 
  USING (created_date::text || ' 12:00:00+00')::timestamptz;

-- ============================================================================
-- Change tasks.due_date
-- ============================================================================

ALTER TABLE tasks 
  ALTER COLUMN due_date TYPE TIMESTAMPTZ 
  USING (due_date::text || ' 12:00:00+00')::timestamptz;

-- ============================================================================
-- Change expenses.date
-- ============================================================================

ALTER TABLE expenses 
  ALTER COLUMN date TYPE TIMESTAMPTZ 
  USING (date::text || ' 12:00:00+00')::timestamptz;

-- ============================================================================
-- Change timeline_events.date
-- ============================================================================

ALTER TABLE timeline_events 
  ALTER COLUMN date TYPE TIMESTAMPTZ 
  USING (date::text || ' 12:00:00+00')::timestamptz;

-- ============================================================================
-- Done!
-- ============================================================================
