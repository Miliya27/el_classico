import { createClient } from '@/lib/supabase/server';

export interface RankingsFilters {
    p_round?: number;
    p_year?: number;
}

export type TopScorer = {
    player_id: string;
    player_name: string;
    team_id: string;
    team_name: string;
    team_code: string;
    goals: number;
    assists: number;
};

export type GoldenGlove = {
    player_id: string;
    player_name: string;
    team_id: string;
    team_name: string;
    team_code: string;
    clean_sheets: number;
    goals_conceded: number;
    saves: number;
    matches_played: number;
};

export type BestPlayer = {
    player_id: string;
    player_name: string;
    team_id: string;
    team_name: string;
    team_code: string;
    motm_count: number;
    goals: number;
    assists: number;
    total_contributions: number;
};

export async function getTopScorers(
    filters: RankingsFilters = {}
): Promise<TopScorer[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_top_scorers', {
        p_round: filters.p_round,
        p_year: filters.p_year,
    });

    if (error) {
        console.error('Error fetching top scorers:', error.message);
        return [];
    }

    return ((data as unknown as TopScorer[]) || []).slice(0, 10);
}

export async function getGoldenGlove(
    filters: RankingsFilters = {}
): Promise<GoldenGlove[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_golden_glove', {
        p_round: filters.p_round,
        p_year: filters.p_year,
    });

    if (error) {
        console.error('Error fetching golden glove:', error.message);
        return [];
    }

    return ((data as unknown as GoldenGlove[]) || []).slice(0, 10);
}

export async function getBestPlayers(
    filters: RankingsFilters = {}
): Promise<BestPlayer[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_best_players', {
        p_round: filters.p_round,
        p_year: filters.p_year,
    });

    if (error) {
        console.error('Error fetching best players:', error.message);
        return [];
    }

    return ((data as unknown as BestPlayer[]) || []).slice(0, 10);
}
