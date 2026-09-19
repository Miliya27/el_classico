# Project Brief — Jwala El Classico

## Purpose

A mobile-first website for a college football tournament. Viewers (students, no login) follow live scores, results, group tables, the knockout bracket, player stats and media. Admins run everything, including live scoring. It replaces an older buggy site built on a third-party platform, where scores were typed as totals with no goal events, so player stats stayed empty.

## Tournament Structure

- **40 teams** = 4 years × 10 classes. Team codes look like `ECA1` = branch + section + semester number (1, 3, 5, 7 = first to fourth year).
- **Round 1 (group stage):** 8 groups of 5 teams (Group A and Group B for each year), round-robin, 10 matches per group, 80 total. Points 3/1/0. Tie-breaks: points, goal difference, goals scored, head-to-head, then manual admin override. Top 2 per group advance (16 teams).
- **Round 2 (16 teams, 8 matches):** within the same year only: A1 vs B2 and A2 vs B1. Auto-filled from group results, admin can edit.
- **Round 3 (8 teams, 4 matches):** admin sets pairings on a "Set pairings" screen (manual pick or random draw). Only advancing teams can be picked; no team in two matches.
- **Round 4 (4 teams, 2 matches) and Round 5 (final):** auto-filled from winners using `next_match_id`, editable by admin.
- Knockout draws: a shootout result must be recorded before the match can be finished.
- **Total: 95 matches.** Groups exist only in Round 1.

## Viewer Features (no login)

Home (live banner, next fixtures, latest results); live match page (score, clock, goal/card timeline, lineups and goalkeepers, updates without refresh); fixtures and results (filter by round, year, group, date); group tables; knockout bracket; team pages (roster, results, stats); rankings; media gallery.

## Admin Features (login)

Setup teams, players, groups, fixtures with date/time; set the active round. Live control: start a match, mark it live (several matches can be live at once), choose goalkeepers, run the clock (start, half-time, full-time). Events: goal (scorer + assist), own goal, card, goalkeeper save, shootout kick; every event editable or undoable. Finish a match: choose Man of the Match, confirm result; standings, stats and awards recalculate automatically. Close group stage: one action fills Round 2. Set Round 3 pairings. Media: upload photos or paste video links with captions. Multiple admin accounts; all changes go into an audit log.

## Awards (Rankings page, filter by all / year / round)

- **Golden Boot:** most goals; ties by assists, then fewer matches played.
- **Golden Glove:** goalkeepers by clean sheets, then fewest goals conceded, then saves.
- **Best Player:** most Man of the Match awards; ties by goals + assists.
- Goals update live; clean sheets and Man of the Match update at full-time.

## Tech Stack

Next.js (App Router, TypeScript strict) + Tailwind, Supabase (Postgres, Auth, Realtime, Storage), deployed on Vercel. Supabase CLI migrations, so the schema is versioned in git.

## Architecture Rules

- Standings, scorers, goalkeeper stats and awards are derived by SQL views. Never typed in by hand.
- Match scores are derived from `match_events` by a database trigger, so score and goal list can never disagree.
- Row Level Security on every table: public read, admin-only write. Admin accounts are created manually, no public signup.
- Realtime is used only on the live match page, with a polling fallback (every 10 seconds). Other pages use normal fetches with short caching.
- The match clock is stored as a start timestamp plus current period. Each browser computes the display locally.
- Photos go in Supabase Storage. Videos are embedded links (YouTube), not uploaded files.
- Tournament name is configurable. Working title from the old site: **"Jwala - El Classico"**.

## Part Roadmap

| Part | Description |
|------|-------------|
| 1 | Scaffold and Supabase connection |
| 2 | Schema, RLS, views, seed data |
| 3 | Public pages |
| 4 | Admin login and CRUD |
| 5 | Live control panel and live page |
| 6 | Finish-match logic and knockout |
| 7 | Rankings and team pages |
| 8 | Media page |
| 9 | Polish, tests, deploy |
