'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { revalidatePath } from 'next/cache';

export async function createPlayerAction(formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const name = (formData.get('name') as string || '').trim();
        const teamId = (formData.get('team_id') as string || '').trim();
        const jerseyNoStr = (formData.get('jersey_no') as string || '').trim();
        const isGk = formData.get('is_gk') === 'true' || formData.get('is_gk') === 'on';

        if (!name || !teamId) {
            return { error: 'Player name and Team selection are required.' };
        }

        let jerseyNo: number | null = null;
        if (jerseyNoStr) {
            jerseyNo = parseInt(jerseyNoStr, 10);
            if (isNaN(jerseyNo) || jerseyNo < 0) {
                return { error: 'Jersey number must be a non-negative integer.' };
            }
        }

        // Check unique jersey_no per team constraint
        if (jerseyNo !== null) {
            const { data: existing } = await supabase
                .from('players')
                .select('id, name')
                .eq('team_id', teamId)
                .eq('jersey_no', jerseyNo)
                .maybeSingle();

            if (existing) {
                return {
                    error: `Jersey number #${jerseyNo} is already assigned to "${existing.name}" in this team. Please choose a different jersey number.`,
                };
            }
        }

        const { error } = await supabase.from('players').insert({
            name,
            team_id: teamId,
            jersey_no: jerseyNo,
            is_gk: isGk,
        });

        if (error) {
            console.error('Create player DB error:', error);
            return { error: 'Failed to add player to team. Please check input values.' };
        }

        revalidatePath('/admin/players');
        revalidatePath('/admin/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Create player action error:', err);
        return { error: 'An unexpected error occurred while adding the player.' };
    }
}

export async function updatePlayerAction(id: string, formData: FormData) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const name = (formData.get('name') as string || '').trim();
        const teamId = (formData.get('team_id') as string || '').trim();
        const jerseyNoStr = (formData.get('jersey_no') as string || '').trim();
        const isGk = formData.get('is_gk') === 'true' || formData.get('is_gk') === 'on';

        if (!name || !teamId) {
            return { error: 'Player name and Team selection are required.' };
        }

        let jerseyNo: number | null = null;
        if (jerseyNoStr) {
            jerseyNo = parseInt(jerseyNoStr, 10);
            if (isNaN(jerseyNo) || jerseyNo < 0) {
                return { error: 'Jersey number must be a non-negative integer.' };
            }
        }

        // Check unique jersey_no per team excluding current player
        if (jerseyNo !== null) {
            const { data: existing } = await supabase
                .from('players')
                .select('id, name')
                .eq('team_id', teamId)
                .eq('jersey_no', jerseyNo)
                .neq('id', id)
                .maybeSingle();

            if (existing) {
                return {
                    error: `Jersey number #${jerseyNo} is already assigned to "${existing.name}" in this team.`,
                };
            }
        }

        const { error } = await supabase
            .from('players')
            .update({
                name,
                team_id: teamId,
                jersey_no: jerseyNo,
                is_gk: isGk,
            })
            .eq('id', id);

        if (error) {
            console.error('Update player DB error:', error);
            return { error: 'Failed to update player details.' };
        }

        revalidatePath('/admin/players');
        revalidatePath('/admin/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Update player action error:', err);
        return { error: 'An unexpected error occurred while updating the player.' };
    }
}

export async function deletePlayerAction(id: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { error } = await supabase.from('players').delete().eq('id', id);

        if (error) {
            console.error('Delete player DB error:', error);
            return { error: 'Failed to delete player.' };
        }

        revalidatePath('/admin/players');
        revalidatePath('/admin/teams');
        return { success: true };
    } catch (err: unknown) {
        console.error('Delete player action error:', err);
        return { error: 'An unexpected error occurred while deleting the player.' };
    }
}
