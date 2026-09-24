import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminGroupsPage() {
    const { user, admin } = await requireAdmin();
    const supabase = await createClient();

    const [groupsRes, teamsRes] = await Promise.all([
        supabase.from('groups').select('*').order('year').order('name'),
        supabase.from('teams').select('id, group_id'),
    ]);

    const groups = groupsRes.data ?? [];
    const teams = teamsRes.data ?? [];

    const groupTeamCounts = new Map<string, number>();
    for (const t of teams) {
        if (t.group_id) {
            groupTeamCounts.set(t.group_id, (groupTeamCounts.get(t.group_id) ?? 0) + 1);
        }
    }

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                        Groups Directory
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Tournament group allocations (8 groups across Years 1–4)
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groups.map((g) => {
                        const count = groupTeamCounts.get(g.id) ?? 0;
                        return (
                            <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                            Year {g.year}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-mono">
                                            {count} Teams
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-100">
                                        Group {g.name}
                                    </h2>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-mono truncate max-w-[140px]" title={g.id}>
                                        ID: {g.id.substring(0, 8)}...
                                    </span>
                                    <Link
                                        href={`/groups`}
                                        className="text-emerald-400 hover:underline font-semibold"
                                    >
                                        View Table →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
