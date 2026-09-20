-- Migration 3: matches
-- Creates matches table with round constraints, knockout pointers, and clock tracking fields

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round SMALLINT NOT NULL CHECK (round BETWEEN 1 AND 5),
  group_id UUID NULL REFERENCES groups(id),
  year SMALLINT NULL CHECK (year BETWEEN 1 AND 4),
  bracket_slot SMALLINT NULL,
  home_team_id UUID NULL REFERENCES teams(id),
  away_team_id UUID NULL REFERENCES teams(id),
  kickoff_at TIMESTAMPTZ NULL,
  venue TEXT NULL,
  status match_status NOT NULL DEFAULT 'scheduled',
  clock_started_at TIMESTAMPTZ NULL,
  clock_offset_seconds INT NOT NULL DEFAULT 0,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  home_pens INT NOT NULL DEFAULT 0,
  away_pens INT NOT NULL DEFAULT 0,
  winner_team_id UUID NULL REFERENCES teams(id),
  motm_player_id UUID NULL REFERENCES players(id),
  next_match_id UUID NULL REFERENCES matches(id),
  next_match_side TEXT NULL CHECK (next_match_side IN ('home', 'away')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT check_distinct_teams CHECK (
    home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id
  ),
  CONSTRAINT check_group_stage_round CHECK (
    (round = 1) = (group_id IS NOT NULL)
  ),
  CONSTRAINT check_year_round CHECK (
    (round <= 2) = (year IS NOT NULL)
  ),
  CONSTRAINT check_finished_knockout_winner CHECK (
    status <> 'finished' OR round < 2 OR winner_team_id IS NOT NULL
  ),
  CONSTRAINT uq_round_bracket_slot UNIQUE (round, bracket_slot)
);
