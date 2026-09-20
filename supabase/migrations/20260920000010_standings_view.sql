-- Migration 10: standings view
-- Creates v_group_standings view with security_invoker = true to derive round 1 standings and tiebreak needs

CREATE OR REPLACE VIEW v_group_standings
WITH (security_invoker = true)
AS
WITH team_matches AS (
  SELECT
    t.id AS team_id,
    t.group_id,
    t.year,
    t.code,
    t.name,
    t.tiebreak_rank,
    m.id AS match_id,
    CASE
      WHEN m.home_team_id = t.id THEN m.home_score
      ELSE m.away_score
    END AS gf,
    CASE
      WHEN m.home_team_id = t.id THEN m.away_score
      ELSE m.home_score
    END AS ga
  FROM teams t
  LEFT JOIN matches m
    ON m.round = 1
   AND m.status = 'finished'
   AND (m.home_team_id = t.id OR m.away_team_id = t.id)
  WHERE t.group_id IS NOT NULL
),
team_totals AS (
  SELECT
    team_id,
    group_id,
    year,
    code,
    name,
    tiebreak_rank,
    COUNT(match_id)::INT AS played,
    COUNT(CASE WHEN gf > ga THEN 1 END)::INT AS won,
    COUNT(CASE WHEN match_id IS NOT NULL AND gf = ga THEN 1 END)::INT AS drawn,
    COUNT(CASE WHEN gf < ga THEN 1 END)::INT AS lost,
    COALESCE(SUM(gf), 0)::INT AS gf,
    COALESCE(SUM(ga), 0)::INT AS ga,
    (COALESCE(SUM(gf), 0) - COALESCE(SUM(ga), 0))::INT AS gd,
    (COUNT(CASE WHEN gf > ga THEN 1 END) * 3 + COUNT(CASE WHEN match_id IS NOT NULL AND gf = ga THEN 1 END) * 1)::INT AS points
  FROM team_matches
  GROUP BY team_id, group_id, year, code, name, tiebreak_rank
),
ranked_standings AS (
  SELECT
    *,
    RANK() OVER (
      PARTITION BY group_id
      ORDER BY
        points DESC,
        gd DESC,
        gf DESC,
        tiebreak_rank ASC NULLS LAST,
        code ASC
    )::INT AS rank
  FROM team_totals
)
SELECT
  rs.team_id,
  rs.group_id,
  rs.year,
  rs.code,
  rs.name,
  rs.tiebreak_rank,
  rs.played,
  rs.won,
  rs.drawn,
  rs.lost,
  rs.gf,
  rs.ga,
  rs.gd,
  rs.points,
  rs.rank,
  EXISTS (
    SELECT 1
    FROM team_totals tt2
    WHERE tt2.group_id = rs.group_id
      AND tt2.team_id <> rs.team_id
      AND tt2.points = rs.points
      AND tt2.gd = rs.gd
      AND tt2.gf = rs.gf
      AND (
        (rs.tiebreak_rank IS NULL AND tt2.tiebreak_rank IS NULL)
        OR (rs.tiebreak_rank = tt2.tiebreak_rank)
      )
  ) AS needs_tiebreak
FROM ranked_standings rs;
