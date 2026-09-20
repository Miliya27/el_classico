-- Migration 2: groups, teams, players
-- Creates core tables for tournament organization: groups, teams, and players

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 4),
  name TEXT NOT NULL CHECK (name IN ('A', 'B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (year, name)
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  year SMALLINT CHECK (year BETWEEN 1 AND 4),
  batch TEXT,
  group_id UUID REFERENCES groups(id),
  tiebreak_rank INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  jersey_no SMALLINT NULL,
  is_gk BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, jersey_no)
);
