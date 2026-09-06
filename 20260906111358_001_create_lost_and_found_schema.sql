/*
# Campus Lost & Found — Core Schema

1. New Tables
  - `profiles`: user profile linked to auth.users. Columns: id (uuid PK, refs auth.users), full_name (text), email (text), is_admin (bool default false), created_at (timestamptz).
  - `items`: lost/found reports. Columns: id (uuid PK), user_id (refs profiles), type ('lost'|'found'), item_name, category, description, location, item_date (date), image_url (text), status ('active'|'returned'), created_at.
  - `claims`: claims on found items. Columns: id (uuid PK), item_id (refs items), claimant_id (refs profiles), reason (text), status ('pending'|'approved'|'rejected'), created_at.

2. Security (RLS)
  - profiles: users read all profiles (needed to show poster names); users update their own row; admins update all.
  - items: anon + authenticated can SELECT active items; authenticated owners can INSERT/UPDATE/DELETE their own rows; admins can SELECT/UPDATE/DELETE all items. (INSERT for admins also allowed.)
  - claims: authenticated users can SELECT their own claims and claims on their own items; authenticated users can INSERT their own claims; admins can SELECT/UPDATE all claims.

3. Trigger
  - `handle_new_user`: on INSERT into auth.users, create a matching profiles row with full_name and email from signup metadata.

4. Storage
  - `item-images` public bucket for item photos.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ---------- items ----------
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('lost','found')),
  item_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL,
  item_date date NOT NULL DEFAULT CURRENT_DATE,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','returned')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS items_type_idx ON items(type);
CREATE INDEX IF NOT EXISTS items_user_idx ON items(user_id);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "items_select_active" ON items;
CREATE POLICY "items_select_active"
  ON items FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "items_select_admin" ON items;
CREATE POLICY "items_select_admin"
  ON items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "items_select_owner" ON items;
CREATE POLICY "items_select_owner"
  ON items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "items_insert_own" ON items;
CREATE POLICY "items_insert_own"
  ON items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "items_update_own" ON items;
CREATE POLICY "items_update_own"
  ON items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "items_update_admin" ON items;
CREATE POLICY "items_update_admin"
  ON items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "items_delete_own" ON items;
CREATE POLICY "items_delete_own"
  ON items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "items_delete_admin" ON items;
CREATE POLICY "items_delete_admin"
  ON items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ---------- claims ----------
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claims_item_idx ON claims(item_id);
CREATE INDEX IF NOT EXISTS claims_claimant_idx ON claims(claimant_id);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Prevent duplicate claims: one active claim per user per item
CREATE UNIQUE INDEX IF NOT EXISTS claims_one_per_user_item
  ON claims(item_id, claimant_id)
  WHERE status IN ('pending','approved');

DROP POLICY IF EXISTS "claims_select_own_or_owner_or_admin" ON claims;
CREATE POLICY "claims_select_own_or_owner_or_admin"
  ON claims FOR SELECT TO authenticated
  USING (
    claimant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM items i WHERE i.id = claims.item_id AND i.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "claims_insert_own" ON claims;
CREATE POLICY "claims_insert_own"
  ON claims FOR INSERT TO authenticated
  WITH CHECK (claimant_id = auth.uid());

DROP POLICY IF EXISTS "claims_update_admin" ON claims;
CREATE POLICY "claims_update_admin"
  ON claims FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ---------- trigger: auto-create profile on signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- storage bucket ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "item_images_select_public" ON storage.objects;
CREATE POLICY "item_images_select_public"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'item-images');

DROP POLICY IF EXISTS "item_images_insert_auth" ON storage.objects;
CREATE POLICY "item_images_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'item-images');

DROP POLICY IF EXISTS "item_images_delete_owner" ON storage.objects;
CREATE POLICY "item_images_delete_owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'item-images' AND owner = auth.uid());
