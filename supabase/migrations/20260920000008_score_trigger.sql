-- Migration 8: score trigger
-- Recomputes match scores and penalty shootout scores automatically from match_events

CREATE OR REPLACE FUNCTION recalc_match_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id UUID;
  v_home_team_id UUID;
  v_away_team_id UUID;
  v_home_score INT := 0;
  v_away_score INT := 0;
  v_home_pens INT := 0;
  v_away_pens INT := 0;
BEGIN
  v_match_id := COALESCE(NEW.match_id, OLD.match_id);

  -- Fetch home and away team IDs
  SELECT home_team_id, away_team_id
  INTO v_home_team_id, v_away_team_id
  FROM matches
  WHERE id = v_match_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculate home goals (goals + own goals credited to home team)
  IF v_home_team_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_home_score
    FROM match_events
    WHERE match_id = v_match_id
      AND team_id = v_home_team_id
      AND type IN ('goal', 'own_goal')
      AND voided_at IS NULL;

    SELECT COUNT(*) INTO v_home_pens
    FROM match_events
    WHERE match_id = v_match_id
      AND team_id = v_home_team_id
      AND type = 'shootout_scored'
      AND voided_at IS NULL;
  END IF;

  -- Calculate away goals (goals + own goals credited to away team)
  IF v_away_team_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_away_score
    FROM match_events
    WHERE match_id = v_match_id
      AND team_id = v_away_team_id
      AND type IN ('goal', 'own_goal')
      AND voided_at IS NULL;

    SELECT COUNT(*) INTO v_away_pens
    FROM match_events
    WHERE match_id = v_match_id
      AND team_id = v_away_team_id
      AND type = 'shootout_scored'
      AND voided_at IS NULL;
  END IF;

  -- Update matches table with freshly calculated totals
  UPDATE matches
  SET
    home_score = v_home_score,
    away_score = v_away_score,
    home_pens = v_home_pens,
    away_pens = v_away_pens,
    updated_at = now()
  WHERE id = v_match_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_recalc_match_score
AFTER INSERT OR UPDATE OR DELETE ON match_events
FOR EACH ROW
EXECUTE FUNCTION recalc_match_score();
