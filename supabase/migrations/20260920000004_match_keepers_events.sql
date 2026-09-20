-- Migration 4: match_keepers and match_events
-- Creates match_keepers for designated goalkeepers and match_events for detailed event logging

CREATE TABLE match_keepers (
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  player_id UUID NOT NULL REFERENCES players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, team_id)
);

CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  type event_type NOT NULL,
  player_id UUID NULL REFERENCES players(id),
  assist_player_id UUID NULL REFERENCES players(id),
  minute SMALLINT NULL CHECK (minute >= 0),
  voided_at TIMESTAMPTZ NULL,
  created_by UUID NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
