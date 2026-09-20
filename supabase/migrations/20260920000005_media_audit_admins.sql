-- Migration 5: media, audit_log, admins
-- Creates admins table linked to auth.users, media gallery metadata table, and audit_log table

CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind media_kind NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NULL,
  caption TEXT NULL,
  match_id UUID NULL REFERENCES matches(id),
  created_by UUID NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NULL,
  old_data JSONB NULL,
  new_data JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
