-- Move Hub Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================================
-- CLEANUP (Drop existing objects if re-running)
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_hub_created ON hubs;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_hub();
DROP FUNCTION IF EXISTS is_hub_member(UUID);
DROP FUNCTION IF EXISTS is_hub_owner(UUID);

DROP POLICY IF EXISTS "Members can view" ON budgets;
DROP POLICY IF EXISTS "Members can insert" ON budgets;
DROP POLICY IF EXISTS "Members can update" ON budgets;
DROP POLICY IF EXISTS "Members can delete" ON budgets;

DROP POLICY IF EXISTS "Members can view" ON inventory_items;
DROP POLICY IF EXISTS "Members can insert" ON inventory_items;
DROP POLICY IF EXISTS "Members can update" ON inventory_items;
DROP POLICY IF EXISTS "Members can delete" ON inventory_items;

DROP POLICY IF EXISTS "Members can view" ON timeline_events;
DROP POLICY IF EXISTS "Members can insert" ON timeline_events;
DROP POLICY IF EXISTS "Members can update" ON timeline_events;
DROP POLICY IF EXISTS "Members can delete" ON timeline_events;

DROP POLICY IF EXISTS "Members can view" ON expenses;
DROP POLICY IF EXISTS "Members can insert" ON expenses;
DROP POLICY IF EXISTS "Members can update" ON expenses;
DROP POLICY IF EXISTS "Members can delete" ON expenses;

DROP POLICY IF EXISTS "Members can view" ON tasks;
DROP POLICY IF EXISTS "Members can insert" ON tasks;
DROP POLICY IF EXISTS "Members can update" ON tasks;
DROP POLICY IF EXISTS "Members can delete" ON tasks;

DROP POLICY IF EXISTS "Members can view" ON move_details;
DROP POLICY IF EXISTS "Members can insert" ON move_details;
DROP POLICY IF EXISTS "Members can update" ON move_details;
DROP POLICY IF EXISTS "Members can delete" ON move_details;

DROP POLICY IF EXISTS "Owners can delete invites" ON hub_invites;
DROP POLICY IF EXISTS "Owners can create invites" ON hub_invites;
DROP POLICY IF EXISTS "Members can view invites for their hubs" ON hub_invites;

DROP POLICY IF EXISTS "Users can remove themselves or owners can remove members" ON hub_members;
DROP POLICY IF EXISTS "Users can add members" ON hub_members;
DROP POLICY IF EXISTS "Owners can add members" ON hub_members;
DROP POLICY IF EXISTS "Users can view members of their hubs" ON hub_members;

DROP POLICY IF EXISTS "Owners can update hubs" ON hubs;
DROP POLICY IF EXISTS "Owners can update their hubs" ON hubs;
DROP POLICY IF EXISTS "Users can create hubs" ON hubs;
DROP POLICY IF EXISTS "Authenticated users can create hubs" ON hubs;
DROP POLICY IF EXISTS "Users can view their hubs" ON hubs;
DROP POLICY IF EXISTS "Users can view hubs they are members of" ON hubs;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS move_details CASCADE;
DROP TABLE IF EXISTS hub_invites CASCADE;
DROP TABLE IF EXISTS hub_members CASCADE;
DROP TABLE IF EXISTS hubs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (needed for member lists)
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- HUBS TABLE (shared move projects)
-- ============================================================================
CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Move',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HUB MEMBERS TABLE
-- ============================================================================
CREATE TABLE hub_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_id, user_id)
);

ALTER TABLE hub_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HUB INVITES TABLE (for pending invitations)
-- ============================================================================
CREATE TABLE hub_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_id, email)
);

ALTER TABLE hub_invites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================
CREATE OR REPLACE FUNCTION is_hub_member(check_hub_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hub_members
    WHERE hub_id = check_hub_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- RLS POLICIES FOR HUBS
-- ============================================================================

-- Allow users to view hubs they created OR are members of
CREATE POLICY "Users can view their hubs"
ON hubs FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR is_hub_member(id)
);

-- Allow any authenticated user to create a hub
CREATE POLICY "Authenticated users can create hubs"
ON hubs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow owners to update their hubs
CREATE POLICY "Owners can update hubs"
ON hubs FOR UPDATE
TO authenticated
USING (is_hub_owner(id));

-- ============================================================================
-- RLS POLICIES FOR HUB MEMBERS
-- ============================================================================

-- Users can view members of hubs they belong to
CREATE POLICY "Users can view members of their hubs"
ON hub_members FOR SELECT
TO authenticated
USING (is_hub_member(hub_id));

-- Users can add themselves, or owners can add others
CREATE POLICY "Users can add members"
ON hub_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR is_hub_owner(hub_id)
);

-- Users can remove themselves, or owners can remove others
CREATE POLICY "Users can remove themselves or owners can remove members"
ON hub_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR is_hub_owner(hub_id)
);

-- ============================================================================
-- RLS POLICIES FOR HUB INVITES
-- ============================================================================
CREATE POLICY "Members can view invites for their hubs"
ON hub_invites FOR SELECT
TO authenticated
USING (is_hub_member(hub_id));

CREATE POLICY "Owners can create invites"
ON hub_invites FOR INSERT
TO authenticated
WITH CHECK (is_hub_owner(hub_id));

CREATE POLICY "Owners can delete invites"
ON hub_invites FOR DELETE
TO authenticated
USING (is_hub_owner(hub_id));

-- ============================================================================
-- MOVE DETAILS TABLE
-- ============================================================================
CREATE TABLE move_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE UNIQUE,
  current_address TEXT,
  new_address TEXT,
  move_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE move_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON move_details FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON move_details FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON move_details FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON move_details FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON tasks FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON tasks FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON tasks FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON tasks FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON expenses FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON expenses FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON expenses FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON expenses FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- TIMELINE EVENTS TABLE
-- ============================================================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON timeline_events FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON timeline_events FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON timeline_events FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON timeline_events FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- INVENTORY ITEMS TABLE
-- ============================================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  disposition TEXT NOT NULL,
  box TEXT,
  value INTEGER,
  notes TEXT,
  sold BOOLEAN DEFAULT FALSE,
  sold_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON inventory_items FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON inventory_items FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON inventory_items FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON inventory_items FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE UNIQUE,
  total_budget INTEGER NOT NULL,
  category_budgets JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view" ON budgets FOR SELECT TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can insert" ON budgets FOR INSERT TO authenticated WITH CHECK (is_hub_member(hub_id));
CREATE POLICY "Members can update" ON budgets FOR UPDATE TO authenticated USING (is_hub_member(hub_id));
CREATE POLICY "Members can delete" ON budgets FOR DELETE TO authenticated USING (is_hub_member(hub_id));

-- ============================================================================
-- TRIGGER: Create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Check for pending invites and add user to hub
  INSERT INTO public.hub_members (hub_id, user_id, role)
  SELECT hub_id, NEW.id, 'member'
  FROM public.hub_invites
  WHERE LOWER(email) = LOWER(NEW.email);

  -- Delete the processed invites
  DELETE FROM public.hub_invites WHERE LOWER(email) = LOWER(NEW.email);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- TRIGGER: Add creator as owner when hub is created
-- ============================================================================
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

-- Trigger to add owner on hub creation
CREATE TRIGGER on_hub_created
  AFTER INSERT ON hubs
  FOR EACH ROW EXECUTE FUNCTION handle_new_hub();

-- ============================================================================
-- DONE! Your database is ready.
-- ============================================================================
