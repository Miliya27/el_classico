# Database Documentation — Jwala El Classico

This document details the Supabase Postgres schema, triggers, functions, Row Level Security (RLS) policies, and seed/reset procedures for the Jwala El Classico football tournament application.

---

## 1. Tables Overview

| Table | Purpose | Key Constraints |
|---|---|---|
| `groups` | 8 tournament groups (A & B for Years 1–4) | `UNIQUE(year, name)` |
| `teams` | 40 competing teams (10 per year) | `UNIQUE(code)`, `year` (1–4) |
| `players` | Team players & designated keepers | `UNIQUE(team_id, jersey_no)`, `is_gk` flag |
| `matches` | 95 total tournament matches | Constraints on round/year/group/knockout fields |
| `match_keepers` | Designated goalkeepers per match | `PRIMARY KEY(match_id, team_id)` |
| `match_events` | Goals, cards, saves, shootouts | `type` enum, soft delete via `voided_at` |
| `media` | Photos (Storage) & video links (YouTube) | `kind` enum (`photo`/`video`) |
| `admins` | Authorized admin users | FK to `auth.users` on delete cascade |
| `audit_log` | Immutable audit trail for mutating ops | System managed identity primary key |

---

## 2. Triggers & Functions

### `validate_match_event()` (BEFORE INSERT/UPDATE ON `match_events`)
- Validates that `team_id` belongs to the home or away team of the match.
- For goals, cards, saves, and shootout kicks, `player_id` must belong to `team_id`.
- For `own_goal`, `player_id` must belong to the **opposing** team, while `team_id` represents the **benefiting** team.
- Enforces that `assist_player_id` is only set for `goal` events, belongs to the scoring team, and is not the scorer.

### `recalc_match_score()` (AFTER INSERT/UPDATE/DELETE ON `match_events`)
- Recomputes `home_score`, `away_score`, `home_pens`, and `away_pens` from scratch for the match.
- Ignores voided events (`voided_at IS NOT NULL`).

### `log_audit_event()` (AFTER INSERT/UPDATE/DELETE)
- Captures `auth.uid()`, action type, table name, record ID, and JSON snapshots of `OLD` and `NEW` data into `audit_log`.

### `set_updated_at()` (BEFORE UPDATE ON `matches` & `match_events`)
- Automatically updates `updated_at = now()`.

---

## 3. RLS Summary

Row Level Security is enabled on **all 9 tables**:
- **Public Read (anon & authenticated):** `groups`, `teams`, `players`, `matches`, `match_keepers`, `match_events`, `media`.
- **Admin Write Only:** `is_admin() = true` required for INSERT/UPDATE/DELETE on public tables.
- **`admins` Table:** Authenticated users can SELECT only their own row (`auth.uid() = user_id`); no client writes.
- **`audit_log` Table:** SELECT restricted to `is_admin() = true`; no client writes.

---

## 4. Views & SQL Functions

- **`v_group_standings` (View):** Aggregates Round 1 finished matches to calculate played, won, drawn, lost, GF, GA, GD, points, group rank, and the `needs_tiebreak` boolean flag. (`WITH (security_invoker = true)`).
- **`get_top_scorers(p_year, p_round)`:** Returns Golden Boot standings (goals, assists). Excludes own goals and voided events.
- **`get_golden_glove(p_year, p_round)`:** Returns keeper statistics (matches played, goals conceded, clean sheets, saves) on finished matches.
- **`get_best_players(p_year, p_round)`:** Ranks players by Man of the Match awards and total goal contributions.

---

## 5. How to Apply & Test

### Applying Migrations
Apply migrations using Supabase CLI:
```bash
npx supabase db push
```

### Running Automated Checks
Run `supabase/tests/part-02-checks.sql` in the Supabase SQL Editor. It runs isolated assertion checks in a transaction block that automatically rolls back.

### Loading Dev Seed Data
Execute `supabase/seed/dev_seed.sql` in the Supabase SQL Editor to populate 40 teams, 8 groups, 80 group stage fixtures, and sample match events.

### Resetting Data
To reset tournament data before real deployment, run `supabase/seed/reset_data.sql` in the Supabase SQL Editor.
