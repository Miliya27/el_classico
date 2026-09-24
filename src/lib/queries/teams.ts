import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

export type PlayerRow = Tables<'players'>;
export type TeamRow = Tables<'teams'>;
export type GroupRow = Tables<'groups'>;

export type TeamDetail = TeamRow & {
    group: GroupRow | null;
    players: PlayerRow[];
};

export type TeamMatch = Tables<'matches'> & {
    home_team: Pick<TeamRow, 'id' | 'name' | 'code'> | null;
    away_team: Pick<TeamRow, 'id' | 'name' | 'code'> | null;
    group: Pick<GroupRow, 'id' | 'name' | 'year'> | null;
};

export async function getTeamByCode(code: string): Promise<TeamDetail | null> {
    const supabase = await createClient();
    const upperCode = code.toUpperCase();

    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('code', upperCode)
        .maybeSingle();

    if (teamError || !team) return null;

    const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', team.id)
        .order('is_gk', { ascending: false })
        .order('jersey_no', { ascending: true, nullsFirst: false });

    let group: GroupRow | null = null;
    if (team.group_id) {
        const { data: g } = await supabase
            .from('groups')
            .select('*')
            .eq('id', team.group_id)
            .maybeSingle();
        group = g ?? null;
    }

    return {
        ...team,
        group,
        players: players ?? [],
    };
}

export async function getTeamMatches(teamId: string): Promise<TeamMatch[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, code),
      away_team:teams!matches_away_team_id_fkey(id, name, code),
      group:groups!matches_group_id_fkey(id, name, year)
    `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('round', { ascending: true })
        .order('kickoff_at', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching team matches:', error.message);
        return [];
    }

    return (data as unknown as TeamMatch[]) || [];
}
