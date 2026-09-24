import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

export type TeamSummary = Pick<Tables<'teams'>, 'id' | 'name' | 'code' | 'year' | 'batch' | 'group_id'>;
export type GroupSummary = Pick<Tables<'groups'>, 'id' | 'name' | 'year'>;

export type MatchWithTeams = Tables<'matches'> & {
    home_team: TeamSummary | null;
    away_team: TeamSummary | null;
    group: GroupSummary | null;
    winner_team?: TeamSummary | null;
};

export async function getLiveMatches(): Promise<MatchWithTeams[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code, year, batch, group_id),
      away_team:teams!matches_away_team_id_fkey(id, name, code, year, batch, group_id),
      group:groups!matches_group_id_fkey(id, name, year)
    `)
        .in('status', ['live', 'half_time'])
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching live matches:', error.message);
        return [];
    }

    return (data as unknown as MatchWithTeams[]) || [];
}

export async function getUpcomingFixtures(limit = 5): Promise<MatchWithTeams[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code, year, batch, group_id),
      away_team:teams!matches_away_team_id_fkey(id, name, code, year, batch, group_id),
      group:groups!matches_group_id_fkey(id, name, year)
    `)
        .eq('status', 'scheduled')
        .order('kickoff_at', { ascending: true, nullsFirst: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching upcoming fixtures:', error.message);
        return [];
    }

    return (data as unknown as MatchWithTeams[]) || [];
}

export async function getLatestResults(limit = 5): Promise<MatchWithTeams[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code, year, batch, group_id),
      away_team:teams!matches_away_team_id_fkey(id, name, code, year, batch, group_id),
      group:groups!matches_group_id_fkey(id, name, year)
    `)
        .eq('status', 'finished')
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching latest results:', error.message);
        return [];
    }

    return (data as unknown as MatchWithTeams[]) || [];
}

export interface FixtureFilters {
    round?: number;
    year?: number;
    group?: string;
    date?: string;
}

export async function getFixtures(filters: FixtureFilters = {}): Promise<MatchWithTeams[]> {
    const supabase = await createClient();
    let query = supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code, year, batch, group_id),
      away_team:teams!matches_away_team_id_fkey(id, name, code, year, batch, group_id),
      group:groups!matches_group_id_fkey(id, name, year)
    `);

    if (filters.round) {
        query = query.eq('round', filters.round);
    }

    if (filters.year) {
        query = query.eq('year', filters.year);
    }

    if (filters.group) {
        query = query.eq('group_id', filters.group);
    }

    if (filters.date) {
        const startOfDay = `${filters.date}T00:00:00.000Z`;
        const endOfDay = `${filters.date}T23:59:59.999Z`;
        query = query.gte('kickoff_at', startOfDay).lte('kickoff_at', endOfDay);
    }

    query = query
        .order('round', { ascending: true })
        .order('kickoff_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching fixtures:', error.message);
        return [];
    }

    return (data as unknown as MatchWithTeams[]) || [];
}

export async function getBracketMatches(): Promise<MatchWithTeams[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code, year, batch, group_id),
      away_team:teams!matches_away_team_id_fkey(id, name, code, year, batch, group_id),
      winner_team:teams!matches_winner_team_id_fkey(id, name, code, year, batch, group_id),
      group:groups!matches_group_id_fkey(id, name, year)
    `)
        .gte('round', 2)
        .order('round', { ascending: true })
        .order('bracket_slot', { ascending: true, nullsFirst: false })
        .order('kickoff_at', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching bracket matches:', error.message);
        return [];
    }

    return (data as unknown as MatchWithTeams[]) || [];
}
