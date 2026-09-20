-- Migration 13: standings tiebreak flag
-- Replaces v_group_standings view to refine needs_tiebreak calculation:
-- needs_tiebreak is TRUE for a team only when ALL of the following hold:
-- (a) Every round 1 match in the team's group has status 'finished' and the group has at least one match
-- (b) Another team in the group is level on points, GD, and GF, and tiebreak_rank does NOT separate them
-- (c) The tied set includes a team whose rank is 1 or 2 (ties among places 3–5 do not matter)

CREATE OR REPLACE VIEW v_group_standings
WITH (security_invoker = true)
AS
WITH group_completion AS (
  SELECT
    g.id AS group_id,
    COUNT(m.id)::INT AS total_matches,
    COUNT(CASE WHEN m.status = 'finished' THEN 1 END)::INT AS finished_matches
  FROM groups g
  LEFT JOIN matches m ON m.group_id = g.id AND m.round = 1
  GROUP BY g.id
),
team_matches AS (
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
    tt.*,
    RANK() OVER (
      PARTITION BY tt.group_id
      ORDER BY
        tt.points DESC,
        tt.gd DESC,
        tt.gf DESC,
        tt.tiebreak_rank ASC NULLS LAST,
        tt.code ASC
    )::INT AS rank
  FROM team_totals tt
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
  (
    -- (a) Every round 1 match in this team's group is 'finished' AND total matches > 0
    COALESCE(gc.total_matches, 0) > 0
    AND gc.total_matches = gc.finished_matches
    AND EXISTS (
      -- (b) Another team in the same group is level on points, GD, and GF, and tiebreak_rank does NOT separate them
      -- AND (c) The tied set includes a team whose rank is 1 or 2
      SELECT 1
      FROM ranked_standings tt2
      WHERE tt2.group_id = rs.group_id
        AND tt2.team_id <> rs.team_id
        AND tt2.points = rs.points
        AND tt2.gd = rs.gd
        AND tt2.gf = rs.gf
        AND (
          (rs.tiebreak_rank IS NULL AND tt2.tiebreak_rank IS NULL)
          OR (rs.tiebreak_rank = tt2.tiebreak_rank)
        )
        AND (rs.rank <= 2 OR tt2.rank <= 2)
    )
  ) AS needs_tiebreak
FROM ranked_standings rs
JOIN group_completion gc ON gc.group_id = rs.group_id;
