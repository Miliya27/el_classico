'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { revalidatePath } from 'next/cache';

export async function createMatchAction(formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const roundStr = formData.get('round') as string;
        const yearStr = formData.get('year') as string;
        const groupId = (formData.get('group_id') as string || '').trim() || null;
        const homeTeamId = (formData.get('home_team_id') as string || '').trim();
        const awayTeamId = (formData.get('away_team_id') as string || '').trim();
        const kickoffAtStr = (formData.get('kickoff_at') as string || '').trim();
        const venue = (formData.get('venue') as string || '').trim() || null;

        if (!roundStr || !homeTeamId || !awayTeamId) {
            return { error: 'Round, Home Team, and Away Team are required.' };
        }

        const round = parseInt(roundStr, 10);
        if (isNaN(round) || round < 1 || round > 5) {
            return { error: 'Round must be between 1 and 5.' };
        }

        const year = yearStr ? parseInt(yearStr, 10) : null;

        // Check constraint: home != away
        if (homeTeamId === awayTeamId) {
            return { error: 'Home and Away teams must be different.' };
        }

        // Check constraint: round 1 requires group_id
        if (round === 1 && !groupId) {
            return { error: 'Round 1 group stage matches must belong to a Group.' };
        }

        // Check constraint: rounds 1 & 2 require year
        if ((round === 1 || round === 2) && !year) {
            return { error: 'Rounds 1 and 2 matches must specify a Year (1 to 4).' };
        }

        const kickoffAt = kickoffAtStr ? new Date(kickoffAtStr).toISOString() : null;

        const { error } = await supabase.from('matches').insert({
            round,
            year,
            group_id: groupId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            kickoff_at: kickoffAt,
            venue,
            status: 'scheduled',
        });

        if (error) {
            console.error('Create match DB error:', error);
            return { error: 'Failed to create match. Please verify team and fixture selection.' };
        }

        revalidatePath('/admin/matches');
        revalidatePath('/fixtures');
        revalidatePath('/');
        return { success: true };
    } catch (err: unknown) {
        console.error('Create match action error:', err);
        return { error: 'An unexpected error occurred while scheduling the match.' };
    }
}

export async function updateMatchAction(id: string, formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const roundStr = formData.get('round') as string;
        const yearStr = formData.get('year') as string;
        const groupId = (formData.get('group_id') as string || '').trim() || null;
        const homeTeamId = (formData.get('home_team_id') as string || '').trim();
        const awayTeamId = (formData.get('away_team_id') as string || '').trim();
        const kickoffAtStr = (formData.get('kickoff_at') as string || '').trim();
        const venue = (formData.get('venue') as string || '').trim() || null;

        if (!roundStr || !homeTeamId || !awayTeamId) {
            return { error: 'Round, Home Team, and Away Team are required.' };
        }

        const round = parseInt(roundStr, 10);
        if (isNaN(round) || round < 1 || round > 5) {
            return { error: 'Round must be between 1 and 5.' };
        }

        const year = yearStr ? parseInt(yearStr, 10) : null;

        // Check constraint: home != away
        if (homeTeamId === awayTeamId) {
            return { error: 'Home and Away teams must be different.' };
        }

        // Check constraint: round 1 requires group_id
        if (round === 1 && !groupId) {
            return { error: 'Round 1 group stage matches must belong to a Group.' };
        }

        // Check constraint: rounds 1 & 2 require year
        if ((round === 1 || round === 2) && !year) {
            return { error: 'Rounds 1 and 2 matches must specify a Year (1 to 4).' };
        }

        const kickoffAt = kickoffAtStr ? new Date(kickoffAtStr).toISOString() : null;

        const { error } = await supabase
            .from('matches')
            .update({
                round,
                year,
                group_id: groupId,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                kickoff_at: kickoffAt,
                venue,
            })
            .eq('id', id);

        if (error) {
            console.error('Update match DB error:', error);
            return { error: 'Failed to update match details.' };
        }

        revalidatePath('/admin/matches');
        revalidatePath('/fixtures');
        revalidatePath('/');
        return { success: true };
    } catch (err: unknown) {
        console.error('Update match action error:', err);
        return { error: 'An unexpected error occurred while updating the match.' };
    }
}

export async function deleteMatchAction(id: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        // Check if match has match events
        const { count } = await supabase
            .from('match_events')
            .select('id', { count: 'exact', head: true })
            .eq('match_id', id);

        if ((count ?? 0) > 0) {
            return { error: 'Cannot delete match because it has match events recorded.' };
        }

        const { error } = await supabase.from('matches').delete().eq('id', id);

        if (error) {
            console.error('Delete match DB error:', error);
            return { error: 'Failed to delete match.' };
        }

        revalidatePath('/admin/matches');
        revalidatePath('/fixtures');
        revalidatePath('/');
        return { success: true };
    } catch (err: unknown) {
        console.error('Delete match action error:', err);
        return { error: 'An unexpected error occurred while deleting the match.' };
    }
}
