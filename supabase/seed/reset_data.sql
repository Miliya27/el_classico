-- ============================================================================
-- DANGER / DESTRUCTIVE SCRIPT - RESET TOURNAMENT DATA
-- ============================================================================
-- WARNING: THIS SCRIPT TRUNCATES/DELETES ALL DATA FROM THE TOURNAMENT TABLES!
-- ALL MATCHES, EVENTS, KEEPERS, MEDIA, PLAYERS, TEAMS, GROUPS, AND AUDIT LOGS
-- WILL BE PERMANENTLY DELETED.
-- USE WITH EXTREME CAUTION BEFORE INITIALIZING PRODUCTION OR REAL DATA.
-- ============================================================================

BEGIN;

TRUNCATE TABLE
  match_events,
  match_keepers,
  media,
  matches,
  players,
  teams,
  groups,
  audit_log
CASCADE;

COMMIT;
