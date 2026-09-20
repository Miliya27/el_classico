-- Migration 6: is_admin and RLS policies
-- Defines security helper public.is_admin() and configures RLS on all tables

-- Function: public.is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = auth.uid()
  );
$$;

-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_keepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Public SELECT policies (anon + authenticated)
CREATE POLICY "Public read access on groups"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Public read access on teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Public read access on players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Public read access on matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Public read access on match_keepers"
  ON match_keepers FOR SELECT
  USING (true);

CREATE POLICY "Public read access on match_events"
  ON match_events FOR SELECT
  USING (true);

CREATE POLICY "Public read access on media"
  ON media FOR SELECT
  USING (true);

-- 2. Admin write policies (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin full write on groups"
  ON groups FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on teams"
  ON teams FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on players"
  ON players FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on matches"
  ON matches FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on match_keepers"
  ON match_keepers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on match_events"
  ON match_events FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full write on media"
  ON media FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Admins table policies: authenticated users can select only their own row; no client writes
CREATE POLICY "Admins can view own admin row"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Audit Log table policies: admins can select; no client writes
CREATE POLICY "Admins can select audit log"
  ON audit_log FOR SELECT
  USING (is_admin());
