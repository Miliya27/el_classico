-- Migration 1: Extensions and Enums
-- Enables pgcrypto extension and creates required enum types

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE match_status AS ENUM (
  'scheduled',
  'live',
  'half_time',
  'finished'
);

CREATE TYPE event_type AS ENUM (
  'goal',
  'own_goal',
  'yellow_card',
  'blue_card',
  'red_card',
  'save',
  'shootout_scored',
  'shootout_missed'
);

CREATE TYPE media_kind AS ENUM (
  'photo',
  'video'
);
