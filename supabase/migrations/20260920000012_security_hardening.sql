-- Migration 12: security hardening
-- Addresses Supabase Security Advisor warnings:
-- 1. Sets search_path = public on public functions to prevent search_path mutable vulnerabilities
-- 2. Revokes public/anon/authenticated EXECUTE permissions on internal trigger functions

-- 1. Fix mutable search_path on public functions
ALTER FUNCTION public.validate_match_event() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.get_top_scorers(integer, integer) SET search_path = public;
ALTER FUNCTION public.get_golden_glove(integer, integer) SET search_path = public;
ALTER FUNCTION public.get_best_players(integer, integer) SET search_path = public;

-- 2. Revoke API execution permissions on internal trigger functions
REVOKE EXECUTE ON FUNCTION public.log_audit_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_match_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_match_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
