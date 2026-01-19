-- ============================================
-- Couple Diary - Supabase Database Schema (FIXED)
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- IMPORTANT: First drop existing policies if you already ran the old schema

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can check pairing codes" ON profiles;
DROP POLICY IF EXISTS "Users can manage own entries" ON entries;
DROP POLICY IF EXISTS "Users can view partner entries" ON entries;
DROP POLICY IF EXISTS "Users can add reactions" ON reactions;
DROP POLICY IF EXISTS "Users can view reactions on own entries" ON reactions;
DROP POLICY IF EXISTS "Users can view own reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  partner_id UUID REFERENCES profiles(id),
  pairing_code TEXT UNIQUE,
  pairing_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENTRIES TABLE
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('happy', 'love', 'grateful', 'peaceful', 'excited', 'sad', 'anxious', 'tired')),
  photo_url TEXT,
  is_special_date BOOLEAN DEFAULT FALSE,
  unlock_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_index INTEGER NOT NULL DEFAULT 0,
  end_index INTEGER NOT NULL DEFAULT 0,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'note')),
  note_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTION (avoids recursion)
-- ============================================
CREATE OR REPLACE FUNCTION get_my_partner_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT partner_id FROM profiles WHERE id = auth.uid();
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FIXED
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- PROFILES policies (simplified to avoid recursion)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_partner"
  ON profiles FOR SELECT
  USING (id = get_my_partner_id());

CREATE POLICY "profiles_select_by_pairing_code"
  ON profiles FOR SELECT
  USING (pairing_code IS NOT NULL AND pairing_code_expires_at > NOW());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ENTRIES policies
CREATE POLICY "entries_all_own"
  ON entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "entries_select_partner"
  ON entries FOR SELECT
  USING (user_id = get_my_partner_id());

-- REACTIONS policies
CREATE POLICY "reactions_insert_own"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_select_on_own_entries"
  ON reactions FOR SELECT
  USING (
    entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid())
  );

CREATE POLICY "reactions_select_own"
  ON reactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_unlock_date ON entries(unlock_date);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_entry_id ON reactions(entry_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pairing_code ON profiles(pairing_code);
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON profiles(partner_id);

-- ============================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
