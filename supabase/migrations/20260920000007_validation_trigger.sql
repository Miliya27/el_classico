-- Migration 7: validation trigger
-- Validates team ownership, player membership, own goal logic, and assists before insert/update on match_events

CREATE OR REPLACE FUNCTION validate_match_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_home_team_id UUID;
  v_away_team_id UUID;
  v_other_team_id UUID;
  v_player_team_id UUID;
  v_assist_team_id UUID;
BEGIN
  -- 1. Fetch match details
  SELECT home_team_id, away_team_id
  INTO v_home_team_id, v_away_team_id
  FROM matches
  WHERE id = NEW.match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match with ID % does not exist.', NEW.match_id;
  END IF;

  -- 2. Verify credited team belongs to the match
  IF NEW.team_id IS NULL OR (NEW.team_id <> v_home_team_id AND NEW.team_id <> v_away_team_id) THEN
    RAISE EXCEPTION 'Credited team % is neither home team % nor away team % for match %.',
      NEW.team_id, v_home_team_id, v_away_team_id, NEW.match_id;
  END IF;

  -- Identify opposing team
  IF NEW.team_id = v_home_team_id THEN
    v_other_team_id := v_away_team_id;
  ELSE
    v_other_team_id := v_home_team_id;
  END IF;

  -- 3. Verify player team membership based on event type
  IF NEW.player_id IS NOT NULL THEN
    SELECT team_id INTO v_player_team_id
    FROM players
    WHERE id = NEW.player_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Player with ID % does not exist.', NEW.player_id;
    END IF;

    IF NEW.type = 'own_goal' THEN
      IF v_other_team_id IS NOT NULL AND v_player_team_id <> v_other_team_id THEN
        RAISE EXCEPTION 'Own goal player % belongs to team %, but must belong to opposing team %.',
          NEW.player_id, v_player_team_id, v_other_team_id;
      END IF;
    ELSE
      IF v_player_team_id <> NEW.team_id THEN
        RAISE EXCEPTION 'Player % belongs to team %, but event is credited to team %.',
          NEW.player_id, v_player_team_id, NEW.team_id;
      END IF;
    END IF;
  END IF;

  -- 4. Verify assist player rules
  IF NEW.assist_player_id IS NOT NULL THEN
    IF NEW.type <> 'goal' THEN
      RAISE EXCEPTION 'Only goal events may have an assist player (event type was %).', NEW.type;
    END IF;

    IF NEW.player_id IS NOT NULL AND NEW.assist_player_id = NEW.player_id THEN
      RAISE EXCEPTION 'Scorer and assist player cannot be the same player (%).', NEW.player_id;
    END IF;

    SELECT team_id INTO v_assist_team_id
    FROM players
    WHERE id = NEW.assist_player_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Assist player with ID % does not exist.', NEW.assist_player_id;
    END IF;

    IF v_assist_team_id <> NEW.team_id THEN
      RAISE EXCEPTION 'Assist player % belongs to team %, expected team %.',
        NEW.assist_player_id, v_assist_team_id, NEW.team_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_match_event
BEFORE INSERT OR UPDATE ON match_events
FOR EACH ROW
EXECUTE FUNCTION validate_match_event();
