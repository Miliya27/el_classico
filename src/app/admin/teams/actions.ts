'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { revalidatePath } from 'next/cache';

export async function createTeamAction(formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const rawCode = (formData.get('code') as string || '').trim().toUpperCase();
        const name = (formData.get('name') as string || '').trim();
        const yearStr = formData.get('year') as string;
        const batch = (formData.get('batch') as string || '').trim() || null;
        const groupId = (formData.get('group_id') as string || '').trim() || null;

        if (!rawCode || !name || !yearStr) {
            return { error: 'Code, Name, and Year are required.' };
        }

        const year = parseInt(yearStr, 10);
        if (isNaN(year) || year < 1 || year > 4) {
            return { error: 'Year must be a number between 1 and 4.' };
        }

        // Check code uniqueness
        const { data: existing } = await supabase
            .from('teams')
            .select('id')
            .eq('code', rawCode)
            .maybeSingle();

        if (existing) {
            return { error: `Team code "${rawCode}" already exists. Please choose a unique code.` };
        }

        const { error } = await supabase.from('teams').insert({
            code: rawCode,
            name,
            year,
            batch,
            group_id: groupId,
        });

        if (error) {
            console.error('Create team DB error:', error);
            return { error: 'Failed to create team. Please verify the input values.' };
        }

        revalidatePath('/admin/teams');
        revalidatePath('/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Create team action error:', err);
        return { error: 'An unexpected error occurred while creating the team.' };
    }
}

export async function updateTeamAction(id: string, formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const rawCode = (formData.get('code') as string || '').trim().toUpperCase();
        const name = (formData.get('name') as string || '').trim();
        const yearStr = formData.get('year') as string;
        const batch = (formData.get('batch') as string || '').trim() || null;
        const groupId = (formData.get('group_id') as string || '').trim() || null;

        if (!rawCode || !name || !yearStr) {
            return { error: 'Code, Name, and Year are required.' };
        }

        const year = parseInt(yearStr, 10);
        if (isNaN(year) || year < 1 || year > 4) {
            return { error: 'Year must be a number between 1 and 4.' };
        }

        // Check code uniqueness excluding current team
        const { data: existing } = await supabase
            .from('teams')
            .select('id')
            .eq('code', rawCode)
            .neq('id', id)
            .maybeSingle();

        if (existing) {
            return { error: `Team code "${rawCode}" is already in use by another team.` };
        }

        const { error } = await supabase
            .from('teams')
            .update({
                code: rawCode,
                name,
                year,
                batch,
                group_id: groupId,
            })
            .eq('id', id);

        if (error) {
            console.error('Update team DB error:', error);
            return { error: 'Failed to update team details.' };
        }

        revalidatePath('/admin/teams');
        revalidatePath('/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Update team action error:', err);
        return { error: 'An unexpected error occurred while updating the team.' };
    }
}

export async function deleteTeamAction(id: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        // Check for associated players or matches
        const [playersRes, homeMatchesRes, awayMatchesRes] = await Promise.all([
            supabase.from('players').select('id', { count: 'exact', head: true }).eq('team_id', id),
            supabase.from('matches').select('id', { count: 'exact', head: true }).eq('home_team_id', id),
            supabase.from('matches').select('id', { count: 'exact', head: true }).eq('away_team_id', id),
        ]);

        const playerCount = playersRes.count ?? 0;
        const matchCount = (homeMatchesRes.count ?? 0) + (awayMatchesRes.count ?? 0);

        if (playerCount > 0 || matchCount > 0) {
            return {
                error: `Cannot delete team because it has ${playerCount} player(s) and ${matchCount} match(es) associated. Please remove or reassign them first.`,
            };
        }

        const { error } = await supabase.from('teams').delete().eq('id', id);

        if (error) {
            console.error('Delete team DB error:', error);
            return { error: 'Failed to delete team.' };
        }

        revalidatePath('/admin/teams');
        revalidatePath('/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Delete team action error:', err);
        return { error: 'An unexpected error occurred while deleting the team.' };
    }
}
