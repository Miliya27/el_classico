import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

export type StandingRow = Tables<'v_group_standings'>;

export interface GroupStandings {
    year: number;
    group_name: string;
    group_id: string;
    rows: StandingRow[];
}

export async function getStandings(): Promise<GroupStandings[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('v_group_standings')
        .select('*')
        .order('year', { ascending: true })
        .order('group_id', { ascending: true })
        .order('rank', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching standings:', error.message);
        return [];
    }

    const rows = (data as StandingRow[]) || [];

    // Group by year then group_id
    const map = new Map<string, GroupStandings>();
    for (const row of rows) {
        if (!row.group_id || !row.year) continue;
        const key = row.group_id;
        if (!map.has(key)) {
            map.set(key, {
                year: row.year,
                group_name: row.name ? '' : '',
                group_id: row.group_id,
                rows: [],
            });
        }
        map.get(key)!.rows.push(row);
    }

    // get group names from groups table
    const groupIds = [...map.keys()];
    if (groupIds.length === 0) return [];

    const { data: groups } = await supabase.from('groups').select('id, name, year').in('id', groupIds);
    for (const g of groups ?? []) {
        const entry = map.get(g.id);
        if (entry) entry.group_name = g.name;
    }

    return [...map.values()].sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.group_name.localeCompare(b.group_name)
    );
}
