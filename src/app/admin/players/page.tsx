import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';
import { PlayerForm, DeletePlayerButton } from './PlayerForm';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ team_id?: string }>;
}

export default async function AdminPlayersPage({ searchParams }: PageProps) {
    const { user, admin } = await requireAdmin();
    const params = await searchParams;
    const teamIdParam = params.team_id;

    const supabase = await createClient();

    let playersQuery = supabase
        .from('players')
        .select('*, team:teams(id, code, name, year)')
        .order('team_id')
        .order('jersey_no', { ascending: true, nullsFirst: false });

    if (teamIdParam) {
        playersQuery = playersQuery.eq('team_id', teamIdParam);
    }

    const [teamsRes, playersRes] = await Promise.all([
        supabase.from('teams').select('id, code, name, year').order('year').order('code'),
        playersQuery,
    ]);

    const teams = teamsRes.data ?? [];
    const players = playersRes.data ?? [];

    const selectedTeam = teamIdParam ? teams.find((t) => t.id === teamIdParam) : null;

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                            Players Management
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            {selectedTeam ? `Showing roster for ${selectedTeam.code} (${selectedTeam.name})` : `Total registered players: ${players.length}`}
                        </p>
                    </div>

                    {/* Team Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Filter Team:</span>
                        <form method="get" className="flex items-center gap-2">
                            <select
                                name="team_id"
                                defaultValue={teamIdParam ?? ''}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                            >
                                <option value="">All Teams</option>
                                {teams.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.code} · Year {t.year}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                            >
                                Filter
                            </button>
                            {teamIdParam && (
                                <Link
                                    href="/admin/players"
                                    className="text-xs text-rose-400 hover:text-rose-300 ml-1"
                                >
                                    ✕ Clear
                                </Link>
                            )}
                        </form>
                    </div>
                </div>

                {/* Add Player Form */}
                <div className="max-w-2xl">
                    <PlayerForm teams={teams} selectedTeamId={teamIdParam} />
                </div>

                {/* Players List Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-100">
                            Roster List ({players.length})
                        </h2>
                    </div>

                    {players.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">
                            No players found for the selected team filter.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 text-left bg-slate-950/50">
                                        <th className="px-4 py-3 font-semibold">No.</th>
                                        <th className="px-3 py-3 font-semibold">Name</th>
                                        <th className="px-3 py-3 font-semibold">Team</th>
                                        <th className="px-3 py-3 font-semibold">Role</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-850 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-slate-300">
                                                {p.jersey_no !== null ? `#${p.jersey_no}` : '—'}
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-slate-100">{p.name}</td>
                                            <td className="px-3 py-3">
                                                {p.team ? (
                                                    <Link href={`/teams/${p.team.code.toLowerCase()}`} className="text-emerald-400 hover:underline font-mono font-semibold">
                                                        {p.team.code}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-500">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {p.is_gk ? (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                                                        GK
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">Outfield</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DeletePlayerButton playerId={p.id} playerName={p.name} />
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
