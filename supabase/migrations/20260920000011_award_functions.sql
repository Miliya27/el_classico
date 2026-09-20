-- Migration 11: award functions
-- Creates SQL functions for Golden Boot (top scorers), Golden Glove (goalkeepers), and Best Player awards
-- All functions are STABLE, SECURITY INVOKER, and support optional year and round filtering

-- 1. get_top_scorers
CREATE OR REPLACE FUNCTION get_top_scorers(
  p_year INT DEFAULT NULL,
  p_round INT DEFAULT NULL
)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  team_id UUID,
  team_code TEXT,
  team_name TEXT,
  goals INT,
  assists INT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH player_goals AS (
    SELECT
      me.player_id,
      COUNT(*)::INT AS goals
    FROM match_events me
    JOIN matches m ON me.match_id = m.id
    JOIN teams t ON me.team_id = t.id
    WHERE me.type = 'goal'
      AND me.voided_at IS NULL
      AND me.player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY me.player_id
  ),
  player_assists AS (
    SELECT
      me.assist_player_id AS player_id,
      COUNT(*)::INT AS assists
    FROM match_events me
    JOIN matches m ON me.match_id = m.id
    JOIN teams t ON me.team_id = t.id
    WHERE me.type = 'goal'
      AND me.voided_at IS NULL
      AND me.assist_player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY me.assist_player_id
  )
  SELECT
    p.id AS player_id,
    p.name AS player_name,
    t.id AS team_id,
    t.code AS team_code,
    t.name AS team_name,
    COALESCE(pg.goals, 0)::INT AS goals,
    COALESCE(pa.assists, 0)::INT AS assists
  FROM players p
  JOIN teams t ON p.team_id = t.id
  LEFT JOIN player_goals pg ON p.id = pg.player_id
  LEFT JOIN player_assists pa ON p.id = pa.player_id
  WHERE (p_year IS NULL OR t.year = p_year)
    AND (COALESCE(pg.goals, 0) > 0 OR COALESCE(pa.assists, 0) > 0)
  ORDER BY goals DESC, assists DESC, player_name ASC;
$$;


-- 2. get_golden_glove
CREATE OR REPLACE FUNCTION get_golden_glove(
  p_year INT DEFAULT NULL,
  p_round INT DEFAULT NULL
)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  team_id UUID,
  team_code TEXT,
  team_name TEXT,
  matches_played INT,
  goals_conceded INT,
  clean_sheets INT,
  saves INT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH keeper_matches AS (
    SELECT
      mk.player_id,
      mk.team_id,
      m.id AS match_id,
      CASE
        WHEN m.home_team_id = mk.team_id THEN m.away_score
        ELSE m.home_score
      END AS conceded
    FROM match_keepers mk
    JOIN matches m ON mk.match_id = m.id
    JOIN teams t ON mk.team_id = t.id
    WHERE m.status = 'finished'
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
  ),
  keeper_stats AS (
    SELECT
      km.player_id,
      km.team_id,
      COUNT(km.match_id)::INT AS matches_played,
      COALESCE(SUM(km.conceded), 0)::INT AS goals_conceded,
      COUNT(CASE WHEN km.conceded = 0 THEN 1 END)::INT AS clean_sheets
    FROM keeper_matches km
    GROUP BY km.player_id, km.team_id
  ),
  keeper_saves AS (
    SELECT
      me.player_id,
      COUNT(*)::INT AS saves
    FROM match_events me
    JOIN matches m ON me.match_id = m.id
    JOIN teams t ON me.team_id = t.id
    WHERE me.type = 'save'
      AND me.voided_at IS NULL
      AND me.player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY me.player_id
  )
  SELECT
    p.id AS player_id,
    p.name AS player_name,
    t.id AS team_id,
    t.code AS team_code,
    t.name AS team_name,
    COALESCE(ks.matches_played, 0)::INT AS matches_played,
    COALESCE(ks.goals_conceded, 0)::INT AS goals_conceded,
    COALESCE(ks.clean_sheets, 0)::INT AS clean_sheets,
    COALESCE(ksv.saves, 0)::INT AS saves
  FROM players p
  JOIN teams t ON p.team_id = t.id
  JOIN keeper_stats ks ON p.id = ks.player_id
  LEFT JOIN keeper_saves ksv ON p.id = ksv.player_id
  WHERE (p_year IS NULL OR t.year = p_year)
  ORDER BY clean_sheets DESC, goals_conceded ASC, saves DESC, player_name ASC;
$$;


-- 3. get_best_players
CREATE OR REPLACE FUNCTION get_best_players(
  p_year INT DEFAULT NULL,
  p_round INT DEFAULT NULL
)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  team_id UUID,
  team_code TEXT,
  team_name TEXT,
  motm_count INT,
  goals INT,
  assists INT,
  total_contributions INT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH motm_stats AS (
    SELECT
      m.motm_player_id AS player_id,
      COUNT(*)::INT AS motm_count
    FROM matches m
    JOIN players p ON m.motm_player_id = p.id
    JOIN teams t ON p.team_id = t.id
    WHERE m.status = 'finished'
      AND m.motm_player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY m.motm_player_id
  ),
  player_goals AS (
    SELECT
      me.player_id,
      COUNT(*)::INT AS goals
    FROM match_events me
    JOIN matches m ON me.match_id = m.id
    JOIN teams t ON me.team_id = t.id
    WHERE me.type = 'goal'
      AND me.voided_at IS NULL
      AND me.player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY me.player_id
  ),
  player_assists AS (
    SELECT
      me.assist_player_id AS player_id,
      COUNT(*)::INT AS assists
    FROM match_events me
    JOIN matches m ON me.match_id = m.id
    JOIN teams t ON me.team_id = t.id
    WHERE me.type = 'goal'
      AND me.voided_at IS NULL
      AND me.assist_player_id IS NOT NULL
      AND (p_year IS NULL OR t.year = p_year)
      AND (p_round IS NULL OR m.round = p_round)
    GROUP BY me.assist_player_id
  )
  SELECT
    p.id AS player_id,
    p.name AS player_name,
    t.id AS team_id,
    t.code AS team_code,
    t.name AS team_name,
    COALESCE(ms.motm_count, 0)::INT AS motm_count,
    COALESCE(pg.goals, 0)::INT AS goals,
    COALESCE(pa.assists, 0)::INT AS assists,
    (COALESCE(pg.goals, 0) + COALESCE(pa.assists, 0))::INT AS total_contributions
  FROM players p
  JOIN teams t ON p.team_id = t.id
  LEFT JOIN motm_stats ms ON p.id = ms.player_id
  LEFT JOIN player_goals pg ON p.id = pg.player_id
  LEFT JOIN player_assists pa ON p.id = pa.player_id
  WHERE (p_year IS NULL OR t.year = p_year)
    AND (COALESCE(ms.motm_count, 0) > 0 OR COALESCE(pg.goals, 0) > 0 OR COALESCE(pa.assists, 0) > 0)
  ORDER BY motm_count DESC, total_contributions DESC, player_name ASC;
$$;
