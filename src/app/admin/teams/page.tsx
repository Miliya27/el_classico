import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';
import { TeamForm, EditTeamButton, DeleteTeamButton } from './TeamForm';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminTeamsPage() {
    const { user, admin } = await requireAdmin();
    const supabase = await createClient();

    const [groupsRes, teamsRes] = await Promise.all([
        supabase.from('groups').select('id, name, year').order('year').order('name'),
        supabase
            .from('teams')
            .select('*, group:groups(id, name, year), players(id), home_matches:matches!home_team_id(id), away_matches:matches!away_team_id(id)')
            .order('year')
            .order('code'),
    ]);

    const groups = groupsRes.data ?? [];
    const rawTeams = teamsRes.data ?? [];

    const teams = rawTeams.map((t) => ({
        ...t,
        player_count: t.players?.length ?? 0,
        match_count: (t.home_matches?.length ?? 0) + (t.away_matches?.length ?? 0),
    }));

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Teams Management</h1>
                        <p className="text-xs text-slate-400 mt-1">Add, edit, or remove tournament teams ({teams.length} total)</p>
                    </div>
                </div>

                {/* Add Team Form */}
                <div className="max-w-2xl">
                    <TeamForm groups={groups} />
                </div>

                {/* Teams Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-100">All Teams ({teams.length})</h2>
                    </div>

                    {teams.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">No teams found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 text-left bg-slate-950/50">
                                        <th className="px-4 py-3 font-semibold">Code</th>
                                        <th className="px-3 py-3 font-semibold">Name</th>
                                        <th className="px-3 py-3 font-semibold">Year</th>
                                        <th className="px-3 py-3 font-semibold">Batch</th>
                                        <th className="px-3 py-3 font-semibold">Group</th>
                                        <th className="px-3 py-3 font-semibold text-center">Players</th>
                                        <th className="px-3 py-3 font-semibold text-center">Matches</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team) => (
                                        <tr key={team.id} className="border-b border-slate-800/50 hover:bg-slate-850 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                                                <Link href={`/teams/${team.code.toLowerCase()}`} className="hover:underline">
                                                    {team.code}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-slate-100">{team.name}</td>
                                            <td className="px-3 py-3 text-slate-300">Year {team.year}</td>
                                            <td className="px-3 py-3 text-slate-400">{team.batch || '—'}</td>
                                            <td className="px-3 py-3">
                                                {team.group ? (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-950/50 border border-emerald-700/40 text-emerald-300 font-semibold">
                                                        Grp {team.group.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-300 font-mono">
                                                <Link href={`/admin/players?team_id=${team.id}`} className="hover:text-emerald-400 transition-colors underline">
                                                    {team.player_count}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-300 font-mono">
                                                {team.match_count}
                                            </td>
                                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                <EditTeamButton team={team} groups={groups} />
                                                <DeleteTeamButton teamId={team.id} teamCode={team.code} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
