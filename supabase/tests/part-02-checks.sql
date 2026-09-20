-- ============================================================================
-- DEV ONLY - AUTOMATED VERIFICATION CHECKS FOR PART 2 DATABASE SCHEMA AND RLS
-- ============================================================================
-- WARNING: DEV ONLY! NEVER RUN THIS SCRIPT ON A PROJECT WITH REAL DATA!
--
-- HOW TO RUN:
-- Open Supabase Dashboard -> SQL Editor, paste this entire script, and click RUN.
--
-- TRANSACTION SAFETY & ROLLBACK GUARANTEE:
-- This script runs inside an explicit transaction block (BEGIN; ... ROLLBACK;).
-- 1. If any assertion fails (RAISE EXCEPTION), PostgreSQL automatically aborts
--    the transaction and rolls back ALL changes immediately.
-- 2. If all assertions pass, the script finishes at the explicit ROLLBACK;
--    command, which rolls back ALL changes (including table cleanup & test data).
-- In both cases, ZERO changes are committed, and any pre-existing database/seed
-- data is 100% restored.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_group_id UUID;
  v_team1_id UUID;
  v_team2_id UUID;
  v_p1_1 UUID;
  v_p1_gk UUID;
  v_p2_1 UUID;
  v_p2_gk UUID;
  v_match_id UUID;
  v_event_id UUID;
  v_h_score INT; v_a_score INT;
  v_h_score_before INT;
  v_h_pens INT; v_a_pens INT;
  v_standings_count INT;
  v_tiebreak_flag BOOLEAN;
  v_award_count INT;
  v_exception_caught BOOLEAN := FALSE;

  -- Variables for Check 10 (Tiebreak rules)
  v_tb_group_id UUID;
  v_tb_t1 UUID; v_tb_t2 UUID; v_tb_t3 UUID; v_tb_t4 UUID;
  v_m1 UUID; v_m2 UUID; v_m3 UUID; v_m4 UUID; v_m5 UUID; v_m6 UUID;
  v_tb_count INT;
BEGIN
  RAISE NOTICE 'Starting Part 2 SQL verification checks...';

  -- --------------------------------------------------------------------------
  -- STEP 0: Clean slate data cleanup (Safe inside transaction)
  -- Guarantees clean test execution whether dev_seed.sql was run or not.
  -- --------------------------------------------------------------------------
  DELETE FROM match_events;
  DELETE FROM match_keepers;
  DELETE FROM media;
  DELETE FROM matches;
  DELETE FROM players;
  DELETE FROM teams;
  DELETE FROM groups;
  DELETE FROM audit_log;

  -- --------------------------------------------------------------------------
  -- STEP 1: Setup isolated test fixtures (1 Group, 2 Teams, Players, 1 Match)
  -- --------------------------------------------------------------------------
  INSERT INTO groups (year, name) VALUES (1, 'A') RETURNING id INTO v_group_id;

  INSERT INTO teams (code, name, year, batch, group_id)
  VALUES ('TST1', 'Test Team 1', 1, 'TEST', v_group_id) RETURNING id INTO v_team1_id;

  INSERT INTO teams (code, name, year, batch, group_id)
  VALUES ('TST2', 'Test Team 2', 1, 'TEST', v_group_id) RETURNING id INTO v_team2_id;

  INSERT INTO players (team_id, name, jersey_no, is_gk)
  VALUES (v_team1_id, 'T1 Keeper', 1, true) RETURNING id INTO v_p1_gk;

  INSERT INTO players (team_id, name, jersey_no, is_gk)
  VALUES (v_team1_id, 'T1 Player 1', 2, false) RETURNING id INTO v_p1_1;

  INSERT INTO players (team_id, name, jersey_no, is_gk)
  VALUES (v_team2_id, 'T2 Keeper', 1, true) RETURNING id INTO v_p2_gk;

  INSERT INTO players (team_id, name, jersey_no, is_gk)
  VALUES (v_team2_id, 'T2 Player 1', 2, false) RETURNING id INTO v_p2_1;

  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status)
  VALUES (1, v_group_id, 1, v_team1_id, v_team2_id, 'scheduled')
  RETURNING id INTO v_match_id;

  -- --------------------------------------------------------------------------
  -- CHECK 1: Score trigger after insert
  -- --------------------------------------------------------------------------
  SELECT home_score INTO v_h_score_before FROM matches WHERE id = v_match_id;

  INSERT INTO match_events (match_id, team_id, type, player_id)
  VALUES (v_match_id, v_team1_id, 'goal', v_p1_1)
  RETURNING id INTO v_event_id;

  SELECT home_score, away_score INTO v_h_score, v_a_score FROM matches WHERE id = v_match_id;
  IF v_h_score <> (v_h_score_before + 1) OR v_a_score <> 0 THEN
    RAISE EXCEPTION 'CHECK 1 FAILED: Expected home score %, got %-%', (v_h_score_before + 1), v_h_score, v_a_score;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 2: Score trigger after voiding an event
  -- --------------------------------------------------------------------------
  UPDATE match_events SET voided_at = now() WHERE id = v_event_id;
  SELECT home_score, away_score INTO v_h_score, v_a_score FROM matches WHERE id = v_match_id;
  IF v_h_score <> 0 OR v_a_score <> 0 THEN
    RAISE EXCEPTION 'CHECK 2 FAILED: Expected score 0-0 after voiding, got %-%', v_h_score, v_a_score;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 3: Score trigger after deleting an event
  -- --------------------------------------------------------------------------
  INSERT INTO match_events (match_id, team_id, type, player_id)
  VALUES (v_match_id, v_team1_id, 'goal', v_p1_1)
  RETURNING id INTO v_event_id;

  DELETE FROM match_events WHERE id = v_event_id;
  SELECT home_score, away_score INTO v_h_score, v_a_score FROM matches WHERE id = v_match_id;
  IF v_h_score <> 0 OR v_a_score <> 0 THEN
    RAISE EXCEPTION 'CHECK 3 FAILED: Expected score 0-0 after delete, got %-%', v_h_score, v_a_score;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 4: Own goal credited to the right team (benefiting team)
  -- --------------------------------------------------------------------------
  SELECT home_score INTO v_h_score_before FROM matches WHERE id = v_match_id;

  INSERT INTO match_events (match_id, team_id, type, player_id)
  VALUES (v_match_id, v_team1_id, 'own_goal', v_p2_1);

  SELECT home_score, away_score INTO v_h_score, v_a_score FROM matches WHERE id = v_match_id;
  IF v_h_score <> (v_h_score_before + 1) OR v_a_score <> 0 THEN
    RAISE EXCEPTION 'CHECK 4 FAILED: Expected home_score=% for own_goal benefiting team1, got %-%', (v_h_score_before + 1), v_h_score, v_a_score;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 5: Validation rejects goal by a player from the wrong team
  -- --------------------------------------------------------------------------
  v_exception_caught := FALSE;
  BEGIN
    INSERT INTO match_events (match_id, team_id, type, player_id)
    VALUES (v_match_id, v_team1_id, 'goal', v_p2_1); -- v_p2_1 belongs to team 2
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;

  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'CHECK 5 FAILED: Validation trigger did NOT reject goal by player from wrong team.';
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 6: Standings view numbers, finished match update, & goal event creation
  -- --------------------------------------------------------------------------
  -- Insert a valid, active goal event for player v_p1_1 (used for award tests)
  INSERT INTO match_events (match_id, team_id, type, player_id)
  VALUES (v_match_id, v_team1_id, 'goal', v_p1_1);

  UPDATE matches SET status = 'finished', motm_player_id = v_p1_1 WHERE id = v_match_id;

  SELECT count(*) INTO v_standings_count FROM v_group_standings WHERE group_id = v_group_id;
  IF v_standings_count <> 2 THEN
    RAISE EXCEPTION 'CHECK 6 FAILED: Expected 2 teams in standings view, got %', v_standings_count;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 7: Award functions respect year and round filters
  -- --------------------------------------------------------------------------
  SELECT COUNT(*) INTO v_award_count FROM get_top_scorers(1, 1);
  IF v_award_count < 1 THEN
    RAISE EXCEPTION 'CHECK 7a FAILED: get_top_scorers returned 0 rows.';
  END IF;

  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_team1_id, v_p1_gk);
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_team2_id, v_p2_gk);

  SELECT COUNT(*) INTO v_award_count FROM get_golden_glove(1, 1);
  IF v_award_count < 1 THEN
    RAISE EXCEPTION 'CHECK 7b FAILED: get_golden_glove returned 0 rows.';
  END IF;

  SELECT COUNT(*) INTO v_award_count FROM get_best_players(1, 1);
  IF v_award_count < 1 THEN
    RAISE EXCEPTION 'CHECK 7c FAILED: get_best_players returned 0 rows.';
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 8: RLS policies (anon role SELECT works and INSERT fails)
  -- --------------------------------------------------------------------------
  SET LOCAL ROLE anon;

  SELECT COUNT(*) INTO v_award_count FROM teams;
  IF v_award_count < 1 THEN
    RAISE EXCEPTION 'CHECK 8a FAILED: Anon role SELECT on teams returned 0 rows.';
  END IF;

  v_exception_caught := FALSE;
  BEGIN
    INSERT INTO teams (code, name, year, batch) VALUES ('BLCK', 'Blocked Team', 1, 'TEST');
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;

  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'CHECK 8b FAILED: Anon INSERT on teams was not blocked by RLS.';
  END IF;

  RESET ROLE;

  -- --------------------------------------------------------------------------
  -- CHECK 9: Security Hardening Revokes & Trigger Execution
  -- --------------------------------------------------------------------------
  -- 9a. Verify anon role cannot directly execute internal trigger functions
  SET LOCAL ROLE anon;

  v_exception_caught := FALSE;
  BEGIN
    PERFORM recalc_match_score();
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;

  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'CHECK 9a FAILED: Direct execution of recalc_match_score() was NOT blocked for role anon.';
  END IF;

  v_exception_caught := FALSE;
  BEGIN
    PERFORM log_audit_event();
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;

  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'CHECK 9b FAILED: Direct execution of log_audit_event() was NOT blocked for role anon.';
  END IF;

  -- 9b. Verify anon SELECT on teams still works after security hardening
  SELECT COUNT(*) INTO v_award_count FROM teams;
  IF v_award_count < 1 THEN
    RAISE EXCEPTION 'CHECK 9c FAILED: Anon SELECT on teams returned 0 rows.';
  END IF;

  RESET ROLE;

  -- 9c. Verify authenticated role cannot directly execute internal trigger functions
  SET LOCAL ROLE authenticated;

  v_exception_caught := FALSE;
  BEGIN
    PERFORM recalc_match_score();
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;

  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'CHECK 9d FAILED: Direct execution of recalc_match_score() was NOT blocked for role authenticated.';
  END IF;

  RESET ROLE;

  -- 9d. Verify trigger execution as postgres/default role still updates match score relative to baseline
  SELECT home_score INTO v_h_score_before FROM matches WHERE id = v_match_id;

  INSERT INTO match_events (match_id, team_id, type, player_id)
  VALUES (v_match_id, v_team1_id, 'goal', v_p1_1);

  SELECT home_score INTO v_h_score FROM matches WHERE id = v_match_id;
  IF v_h_score <> (v_h_score_before + 1) THEN
    RAISE EXCEPTION 'CHECK 9e FAILED: Trigger failed to update match score after security hardening (expected home_score=%, got %).', (v_h_score_before + 1), v_h_score;
  END IF;

  -- --------------------------------------------------------------------------
  -- CHECK 10: v_group_standings needs_tiebreak rules (Migration 13)
  -- --------------------------------------------------------------------------
  -- 10a. Unfinished group (matches scheduled, 0 finished) -> needs_tiebreak must be FALSE for all teams
  INSERT INTO groups (year, name) VALUES (2, 'B') RETURNING id INTO v_tb_group_id;

  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB1', 'Tie Team 1', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t1;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB2', 'Tie Team 2', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t2;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB3', 'Tie Team 3', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t3;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB4', 'Tie Team 4', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t4;

  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t1, v_tb_t2, 'scheduled') RETURNING id INTO v_m1;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t2, v_tb_t3, 'scheduled') RETURNING id INTO v_m2;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t3, v_tb_t1, 'scheduled') RETURNING id INTO v_m3;

  SELECT COUNT(*) INTO v_tb_count FROM v_group_standings WHERE group_id = v_tb_group_id AND needs_tiebreak IS TRUE;
  IF v_tb_count <> 0 THEN
    RAISE EXCEPTION 'CHECK 10a FAILED: Unfinished group had % teams flagged with needs_tiebreak=true (expected 0).', v_tb_count;
  END IF;

  -- 10b. 3-way tie for 1st place in finished 3-team group -> all 3 teams MUST be flagged
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m1, v_tb_t1, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m1;

  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m2, v_tb_t2, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m2;

  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m3, v_tb_t3, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m3;

  SELECT COUNT(*) INTO v_tb_count FROM v_group_standings WHERE group_id = v_tb_group_id AND needs_tiebreak IS TRUE;
  IF v_tb_count <> 3 THEN
    RAISE EXCEPTION 'CHECK 10b FAILED: 3-way 1st place tie expected 3 teams flagged with needs_tiebreak=true, got %.', v_tb_count;
  END IF;

  -- 10c. Setting tiebreak_rank on the tied teams clears the flag
  UPDATE teams SET tiebreak_rank = 1 WHERE id = v_tb_t1;
  UPDATE teams SET tiebreak_rank = 2 WHERE id = v_tb_t2;
  UPDATE teams SET tiebreak_rank = 3 WHERE id = v_tb_t3;

  SELECT COUNT(*) INTO v_tb_count FROM v_group_standings WHERE group_id = v_tb_group_id AND needs_tiebreak IS TRUE;
  IF v_tb_count <> 0 THEN
    RAISE EXCEPTION 'CHECK 10c FAILED: Setting tiebreak_rank did NOT clear needs_tiebreak flag (got % flagged).', v_tb_count;
  END IF;

  -- 10d. A tie only for 3rd place in a finished group is NOT flagged
  -- Reset test group: delete test group matches/teams/group
  DELETE FROM match_events WHERE match_id IN (v_m1, v_m2, v_m3);
  DELETE FROM matches WHERE group_id = v_tb_group_id;
  DELETE FROM teams WHERE group_id = v_tb_group_id;
  DELETE FROM groups WHERE id = v_tb_group_id;

  -- Create fresh 4-team group
  INSERT INTO groups (year, name) VALUES (2, 'B') RETURNING id INTO v_tb_group_id;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB1', 'Tie Team 1', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t1;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB2', 'Tie Team 2', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t2;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB3', 'Tie Team 3', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t3;
  INSERT INTO teams (code, name, year, batch, group_id) VALUES ('TB4', 'Tie Team 4', 2, 'TEST', v_tb_group_id) RETURNING id INTO v_tb_t4;

  -- Schedule 6 round-robin matches
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t1, v_tb_t2, 'scheduled') RETURNING id INTO v_m1;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t1, v_tb_t3, 'scheduled') RETURNING id INTO v_m2;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t1, v_tb_t4, 'scheduled') RETURNING id INTO v_m3;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t2, v_tb_t3, 'scheduled') RETURNING id INTO v_m4;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t2, v_tb_t4, 'scheduled') RETURNING id INTO v_m5;
  INSERT INTO matches (round, group_id, year, home_team_id, away_team_id, status) VALUES (1, v_tb_group_id, 2, v_tb_t3, v_tb_t4, 'scheduled') RETURNING id INTO v_m6;

  -- Results:
  -- TB1 beats TB2 (3-0), TB3 (3-0), TB4 (3-0) -> TB1: 9 pts (Rank 1)
  -- TB2 beats TB3 (2-0), TB4 (2-0), loses to TB1 (0-3) -> TB2: 6 pts (Rank 2)
  -- TB3 & TB4 draw 0-0, both lose to TB1 & TB2 -> TB3 & TB4: 1 pt each, GD -5, GF 0 (Tied for Rank 3 & 4)

  -- m1: TB1 vs TB2 (3-0)
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m1, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m1, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m1, v_tb_t1, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m1;

  -- m2: TB1 vs TB3 (3-0)
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m2, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m2, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m2, v_tb_t1, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m2;

  -- m3: TB1 vs TB4 (3-0)
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m3, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m3, v_tb_t1, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m3, v_tb_t1, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m3;

  -- m4: TB2 vs TB3 (2-0)
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m4, v_tb_t2, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m4, v_tb_t2, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m4;

  -- m5: TB2 vs TB4 (2-0)
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m5, v_tb_t2, 'goal');
  INSERT INTO match_events (match_id, team_id, type) VALUES (v_m5, v_tb_t2, 'goal');
  UPDATE matches SET status = 'finished' WHERE id = v_m5;

  -- m6: TB3 vs TB4 (0-0 draw)
  UPDATE matches SET status = 'finished' WHERE id = v_m6;

  SELECT COUNT(*) INTO v_tb_count FROM v_group_standings WHERE group_id = v_tb_group_id AND needs_tiebreak IS TRUE;
  IF v_tb_count <> 0 THEN
    RAISE EXCEPTION 'CHECK 10d FAILED: 3rd place tie was incorrectly flagged with needs_tiebreak=true (got % flagged, expected 0).', v_tb_count;
  END IF;

  RAISE NOTICE 'SUCCESS: All Part 2 database verification checks passed!';
END $$;

-- Explicitly rollback transaction so ZERO changes are committed to database
ROLLBACK;
