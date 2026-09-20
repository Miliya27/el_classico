-- Migration 9: audit trigger and set_updated_at trigger
-- Sets updated_at timestamp on updates and logs audit history for mutating operations

-- Function: set_updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER trg_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_match_events_updated_at
BEFORE UPDATE ON match_events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- Function: log_audit_event
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'match_keepers' THEN
    IF TG_OP = 'DELETE' THEN
      v_record_id := OLD.match_id::text || '_' || OLD.team_id::text;
    ELSE
      v_record_id := NEW.match_id::text || '_' || NEW.team_id::text;
    END IF;
  ELSE
    IF TG_OP = 'DELETE' THEN
      v_record_id := OLD.id::text;
    ELSE
      v_record_id := NEW.id::text;
    END IF;
  END IF;

  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN NULL;
END;
$$;

-- Audit triggers on teams, players, matches, match_events, match_keepers, media
CREATE TRIGGER trg_audit_teams
AFTER INSERT OR UPDATE OR DELETE ON teams
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_players
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_matches
AFTER INSERT OR UPDATE OR DELETE ON matches
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_match_events
AFTER INSERT OR UPDATE OR DELETE ON match_events
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_match_keepers
AFTER INSERT OR UPDATE OR DELETE ON match_keepers
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_media
AFTER INSERT OR UPDATE OR DELETE ON media
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
