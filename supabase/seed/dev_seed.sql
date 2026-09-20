-- ============================================================================
-- DEV SEED DATA - Jwala El Classico Football Tournament
-- ============================================================================
-- NOTE: For local development and testing only. Do NOT run in production.
-- ============================================================================

DO $$
DECLARE
  v_y1_ga UUID; v_y1_gb UUID;
  v_y2_ga UUID; v_y2_gb UUID;
  v_y3_ga UUID; v_y3_gb UUID;
  v_y4_ga UUID; v_y4_gb UUID;

  v_teams_y1a UUID[] := ARRAY[]::UUID[];
  v_teams_y1b UUID[] := ARRAY[]::UUID[];
  v_teams_y2a UUID[] := ARRAY[]::UUID[];
  v_teams_y2b UUID[] := ARRAY[]::UUID[];
  v_teams_y3a UUID[] := ARRAY[]::UUID[];
  v_teams_y3b UUID[] := ARRAY[]::UUID[];
  v_teams_y4a UUID[] := ARRAY[]::UUID[];
  v_teams_y4b UUID[] := ARRAY[]::UUID[];

  v_team_id UUID;
  v_player_id UUID;
  v_match_id UUID;
  v_t1 UUID; v_t2 UUID; v_t3 UUID; v_t4 UUID; v_t5 UUID;
  v_p1_1 UUID; v_p1_2 UUID; v_p1_gk UUID;
  v_p2_1 UUID; v_p2_2 UUID; v_p2_gk UUID;
  v_p3_1 UUID; v_p3_gk UUID;
  v_p4_1 UUID; v_p4_gk UUID;
  v_p5_1 UUID; v_p5_gk UUID;

  v_batches TEXT[] := ARRAY['CSA', 'CSB', 'CSC', 'ECA', 'ECB', 'EEE', 'ME', 'CU', 'EV', 'EB'];
  v_semesters SMALLINT[] := ARRAY[1, 3, 5, 7];
  v_sem SMALLINT;
  v_batch TEXT;
  v_year SMALLINT;
  v_code TEXT;
  v_name TEXT;
  i INT; j INT; k INT;
  v_match_index INT := 0;
BEGIN
  -- 1. Create 8 Groups (Group A & B for Years 1..4)
  INSERT INTO groups (year, name) VALUES (1, 'A') RETURNING id INTO v_y1_ga;
  INSERT INTO groups (year, name) VALUES (1, 'B') RETURNING id INTO v_y1_gb;
  INSERT INTO groups (year, name) VALUES (2, 'A') RETURNING id INTO v_y2_ga;
  INSERT INTO groups (year, name) VALUES (2, 'B') RETURNING id INTO v_y2_gb;
  INSERT INTO groups (year, name) VALUES (3, 'A') RETURNING id INTO v_y3_ga;
  INSERT INTO groups (year, name) VALUES (3, 'B') RETURNING id INTO v_y3_gb;
  INSERT INTO groups (year, name) VALUES (4, 'A') RETURNING id INTO v_y4_ga;
  INSERT INTO groups (year, name) VALUES (4, 'B') RETURNING id INTO v_y4_gb;

  -- 2. Create 40 Teams across 10 batches x 4 semesters
  FOR s IN 1..4 LOOP
    v_sem := v_semesters[s];
    v_year := s;

    FOR b IN 1..10 LOOP
      v_batch := v_batches[b];
      v_code := v_batch || v_sem;
      v_name := v_batch || ' Semester ' || v_sem;

      INSERT INTO teams (code, name, year, batch, group_id)
      VALUES (
        v_code,
        v_name,
        v_year,
        v_batch,
        CASE
          WHEN v_year = 1 AND b <= 5 THEN v_y1_ga
          WHEN v_year = 1 THEN v_y1_gb
          WHEN v_year = 2 AND b <= 5 THEN v_y2_ga
          WHEN v_year = 2 THEN v_y2_gb
          WHEN v_year = 3 AND b <= 5 THEN v_y3_ga
          WHEN v_year = 3 THEN v_y3_gb
          WHEN v_year = 4 AND b <= 5 THEN v_y4_ga
          ELSE v_y4_gb
        END
      )
      RETURNING id INTO v_team_id;

      -- Track group team IDs
      IF v_year = 1 AND b <= 5 THEN v_teams_y1a := array_append(v_teams_y1a, v_team_id);
      ELSIF v_year = 1 THEN v_teams_y1b := array_append(v_teams_y1b, v_team_id);
      ELSIF v_year = 2 AND b <= 5 THEN v_teams_y2a := array_append(v_teams_y2a, v_team_id);
      ELSIF v_year = 2 THEN v_teams_y2b := array_append(v_teams_y2b, v_team_id);
      ELSIF v_year = 3 AND b <= 5 THEN v_teams_y3a := array_append(v_teams_y3a, v_team_id);
      ELSIF v_year = 3 THEN v_teams_y3b := array_append(v_teams_y3b, v_team_id);
      ELSIF v_year = 4 AND b <= 5 THEN v_teams_y4a := array_append(v_teams_y4a, v_team_id);
      ELSE v_teams_y4b := array_append(v_teams_y4b, v_team_id);
      END IF;

      -- Add 7 Players per team (1 Goalkeeper + 6 Outfielders)
      INSERT INTO players (team_id, name, jersey_no, is_gk)
      VALUES (v_team_id, v_code || ' Keeper', 1, true);

      FOR p IN 2..7 LOOP
        INSERT INTO players (team_id, name, jersey_no, is_gk)
        VALUES (v_team_id, v_code || ' Player ' || p, p, false);
      END LOOP;
    END LOOP;
  END LOOP;

  -- 3. Schedule 80 Round 1 Group Stage Fixtures (10 matches x 8 groups)
  -- Helper block to insert 10 round-robin matches per group
  -- Pairings for 5 teams: (1-2, 3-4, 1-3, 2-5, 1-4, 3-5, 1-5, 2-4, 2-3, 4-5)
  FOR g IN 1..8 LOOP
    DECLARE
      v_curr_teams UUID[];
      v_curr_group UUID;
      v_curr_year SMALLINT;
      v_pairs INT[10][2] := ARRAY[
        [1,2], [3,4], [1,3], [2,5], [1,4],
        [3,5], [1,5], [2,4], [2,3], [4,5]
      ];
    BEGIN
      CASE g
        WHEN 1 THEN v_curr_teams := v_teams_y1a; v_curr_group := v_y1_ga; v_curr_year := 1;
        WHEN 2 THEN v_curr_teams := v_teams_y1b; v_curr_group := v_y1_gb; v_curr_year := 1;
        WHEN 3 THEN v_curr_teams := v_teams_y2a; v_curr_group := v_y2_ga; v_curr_year := 2;
        WHEN 4 THEN v_curr_teams := v_teams_y2b; v_curr_group := v_y2_gb; v_curr_year := 2;
        WHEN 5 THEN v_curr_teams := v_teams_y3a; v_curr_group := v_y3_ga; v_curr_year := 3;
        WHEN 6 THEN v_curr_teams := v_teams_y3b; v_curr_group := v_y3_gb; v_curr_year := 3;
        WHEN 7 THEN v_curr_teams := v_teams_y4a; v_curr_group := v_y4_ga; v_curr_year := 4;
        WHEN 8 THEN v_curr_teams := v_teams_y4b; v_curr_group := v_y4_gb; v_curr_year := 4;
      END CASE;

      FOR m IN 1..10 LOOP
        v_match_index := v_match_index + 1;
        INSERT INTO matches (
          round,
          group_id,
          year,
          home_team_id,
          away_team_id,
          kickoff_at,
          venue,
          status
        ) VALUES (
          1,
          v_curr_group,
          v_curr_year,
          v_curr_teams[v_pairs[m][1]],
          v_curr_teams[v_pairs[m][2]],
          now() + (v_match_index || ' hours')::INTERVAL,
          'Main Ground Pitch 1',
          'scheduled'
        );
      END LOOP;
    END;
  END LOOP;

  -- 4. Populate played matches & live match for ONE group (Year 1 Group A) to test views
  v_t1 := v_teams_y1a[1];
  v_t2 := v_teams_y1a[2];
  v_t3 := v_teams_y1a[3];
  v_t4 := v_teams_y1a[4];
  v_t5 := v_teams_y1a[5];

  -- Fetch key players for events
  SELECT id INTO v_p1_gk FROM players WHERE team_id = v_t1 AND is_gk = true;
  SELECT id INTO v_p1_1  FROM players WHERE team_id = v_t1 AND jersey_no = 2;
  SELECT id INTO v_p1_2  FROM players WHERE team_id = v_t1 AND jersey_no = 3;

  SELECT id INTO v_p2_gk FROM players WHERE team_id = v_t2 AND is_gk = true;
  SELECT id INTO v_p2_1  FROM players WHERE team_id = v_t2 AND jersey_no = 2;
  SELECT id INTO v_p2_2  FROM players WHERE team_id = v_t2 AND jersey_no = 3;

  SELECT id INTO v_p3_gk FROM players WHERE team_id = v_t3 AND is_gk = true;
  SELECT id INTO v_p3_1  FROM players WHERE team_id = v_t3 AND jersey_no = 2;

  SELECT id INTO v_p4_gk FROM players WHERE team_id = v_t4 AND is_gk = true;
  SELECT id INTO v_p4_1  FROM players WHERE team_id = v_t4 AND jersey_no = 2;

  SELECT id INTO v_p5_gk FROM players WHERE team_id = v_t5 AND is_gk = true;
  SELECT id INTO v_p5_1  FROM players WHERE team_id = v_t5 AND jersey_no = 2;

  -- Match 1: Team 1 vs Team 2 (Finished: 2 - 1)
  SELECT id INTO v_match_id FROM matches WHERE home_team_id = v_t1 AND away_team_id = v_t2;
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t1, v_p1_gk);
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t2, v_p2_gk);

  -- Goal 1 for T1 (v_p1_1 assist v_p1_2)
  INSERT INTO match_events (match_id, team_id, type, player_id, assist_player_id, minute)
  VALUES (v_match_id, v_t1, 'goal', v_p1_1, v_p1_2, 12);

  -- Goal 2 for T1 (v_p1_2 solo)
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t1, 'goal', v_p1_2, 34);

  -- Goal 1 for T2 (v_p2_1 solo)
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t2, 'goal', v_p2_1, 41);

  -- Saves
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t1, 'save', v_p1_gk, 22);

  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t2, 'save', v_p2_gk, 50);

  UPDATE matches SET status = 'finished', motm_player_id = v_p1_1 WHERE id = v_match_id;

  -- Match 2: Team 3 vs Team 4 (Finished: 3 - 0)
  SELECT id INTO v_match_id FROM matches WHERE home_team_id = v_t3 AND away_team_id = v_t4;
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t3, v_p3_gk);
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t4, v_p4_gk);

  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t3, 'goal', v_p3_1, 10);
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t3, 'goal', v_p3_1, 25);
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t3, 'goal', v_p3_1, 60);

  UPDATE matches SET status = 'finished', motm_player_id = v_p3_1 WHERE id = v_match_id;

  -- Match 3: Team 1 vs Team 3 (Live: 1 - 1 in progress)
  SELECT id INTO v_match_id FROM matches WHERE home_team_id = v_t1 AND away_team_id = v_t3;
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t1, v_p1_gk);
  INSERT INTO match_keepers (match_id, team_id, player_id) VALUES (v_match_id, v_t3, v_p3_gk);

  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t1, 'goal', v_p1_1, 15);
  INSERT INTO match_events (match_id, team_id, type, player_id, minute)
  VALUES (v_match_id, v_t3, 'goal', v_p3_1, 28);

  UPDATE matches SET status = 'live', clock_started_at = now() - INTERVAL '15 minutes' WHERE id = v_match_id;

END $$;
