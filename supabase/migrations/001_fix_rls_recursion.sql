-- Migration 001: Fix RLS infinite recursion
-- Run this if you already have the database set up and need to fix the recursion issue
-- If starting fresh, just run supabase-schema.sql instead

-- ============================================================================
-- Add is_hub_owner helper function
-- ============================================================================
CREATE OR REPLACE FUNCTION is_hub_owner(check_hub_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hub_members
    WHERE hub_id = check_hub_id AND user_id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Fix hub_members policies (remove inline subqueries that cause recursion)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view members of their hubs" ON hub_members;
DROP POLICY IF EXISTS "Users can add members" ON hub_members;
DROP POLICY IF EXISTS "Owners can add members" ON hub_members;
DROP POLICY IF EXISTS "Users can remove themselves or owners can remove members" ON hub_members;

CREATE POLICY "Users can view members of their hubs"
ON hub_members FOR SELECT
TO authenticated
USING (is_hub_member(hub_id));

CREATE POLICY "Users can add members"
ON hub_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR is_hub_owner(hub_id)
);

CREATE POLICY "Users can remove themselves or owners can remove members"
ON hub_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR is_hub_owner(hub_id)
);

-- ============================================================================
-- Fix hubs policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their hubs" ON hubs;
DROP POLICY IF EXISTS "Users can view hubs they are members of" ON hubs;
DROP POLICY IF EXISTS "Owners can update hubs" ON hubs;
DROP POLICY IF EXISTS "Owners can update their hubs" ON hubs;

CREATE POLICY "Users can view their hubs"
ON hubs FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR is_hub_member(id)
);

CREATE POLICY "Owners can update hubs"
ON hubs FOR UPDATE
TO authenticated
USING (is_hub_owner(id));

-- ============================================================================
-- Fix hub_invites policies
-- ============================================================================
DROP POLICY IF EXISTS "Owners can create invites" ON hub_invites;
DROP POLICY IF EXISTS "Owners can delete invites" ON hub_invites;

CREATE POLICY "Owners can create invites"
ON hub_invites FOR INSERT
TO authenticated
WITH CHECK (is_hub_owner(hub_id));

CREATE POLICY "Owners can delete invites"
ON hub_invites FOR DELETE
TO authenticated
USING (is_hub_owner(hub_id));

-- ============================================================================
-- Add trigger to automatically add hub creator as owner
-- ============================================================================
DROP TRIGGER IF EXISTS on_hub_created ON hubs;
DROP FUNCTION IF EXISTS handle_new_hub();

CREATE OR REPLACE FUNCTION handle_new_hub()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hub_members (hub_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_hub: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_hub_created
  AFTER INSERT ON hubs
  FOR EACH ROW EXECUTE FUNCTION handle_new_hub();

-- ============================================================================
-- Done!
-- ============================================================================
