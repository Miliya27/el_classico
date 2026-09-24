import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';
import { MatchForm, DeleteMatchButton } from './MatchForm';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{
        round?: string;
        year?: string;
        group_id?: string;
        status?: string;
    }>;
}

export default async function AdminMatchesPage({ searchParams }: PageProps) {
    const { user, admin } = await requireAdmin();
    const params = await searchParams;

    const roundParam = params.round;
    const yearParam = params.year;
    const groupParam = params.group_id;
    const statusParam = params.status;

    const supabase = await createClient();

    let matchesQuery = supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!home_team_id(id, code, name, year),
      away_team:teams!away_team_id(id, code, name, year),
      group:groups(id, name, year)
    `)
        .order('round', { ascending: true })
        .order('kickoff_at', { ascending: true, nullsFirst: false });

    if (roundParam) matchesQuery = matchesQuery.eq('round', parseInt(roundParam, 10));
    if (yearParam) matchesQuery = matchesQuery.eq('year', parseInt(yearParam, 10));
    if (groupParam) matchesQuery = matchesQuery.eq('group_id', groupParam);
    if (statusParam) matchesQuery = matchesQuery.eq('status', statusParam as any);

    const [groupsRes, teamsRes, matchesRes] = await Promise.all([
        supabase.from('groups').select('id, name, year').order('year').order('name'),
        supabase.from('teams').select('id, code, name, year').order('year').order('code'),
        matchesQuery,
    ]);

    const groups = groupsRes.data ?? [];
    const teams = teamsRes.data ?? [];
    const matches = matchesRes.data ?? [];

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                            Fixtures & Matches Management
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Schedule matches, set venues, and manage fixture details ({matches.length} matches shown)
                        </p>
                    </div>

                    {/* Filters */}
                    <form method="get" className="flex flex-wrap items-center gap-2">
                        <select
                            name="round"
                            defaultValue={roundParam ?? ''}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">All Rounds</option>
                            <option value="1">R1 (Group)</option>
                            <option value="2">R2 (R16)</option>
                            <option value="3">R3 (QF)</option>
                            <option value="4">R4 (SF)</option>
                            <option value="5">R5 (Final)</option>
                        </select>

                        <select
                            name="year"
                            defaultValue={yearParam ?? ''}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>

                        <select
                            name="status"
                            defaultValue={statusParam ?? ''}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="half_time">Half Time</option>
                            <option value="finished">Finished</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                            Filter
                        </button>
                        {(roundParam || yearParam || groupParam || statusParam) && (
                            <Link
                                href="/admin/matches"
                                className="text-xs text-rose-400 hover:text-rose-300 ml-1"
                            >
                                ✕ Clear
                            </Link>
                        )}
                    </form>
                </div>

                {/* Schedule Match Form */}
                <div className="max-w-3xl">
                    <MatchForm teams={teams} groups={groups} />
                </div>

                {/* Matches Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-100">
                            Matches List ({matches.length})
                        </h2>
                    </div>

                    {matches.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">
                            No matches found matching filter criteria.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 text-left bg-slate-950/50">
                                        <th className="px-4 py-3 font-semibold">Rd</th>
                                        <th className="px-3 py-3 font-semibold">Group/Year</th>
                                        <th className="px-3 py-3 font-semibold">Fixture</th>
                                        <th className="px-3 py-3 font-semibold text-center">Score (Read-Only)</th>
                                        <th className="px-3 py-3 font-semibold">Kickoff / Venue</th>
                                        <th className="px-3 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((m) => (
                                        <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-850 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-200">
                                                R{m.round}
                                            </td>
                                            <td className="px-3 py-3">
                                                {m.group ? (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-semibold">
                                                        Yr {m.group.year} Grp {m.group.name}
                                                    </span>
                                                ) : m.year ? (
                                                    <span className="text-slate-400">Year {m.year}</span>
                                                ) : (
                                                    <span className="text-slate-500">Knockout</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 font-medium text-slate-100">
                                                <span className="text-emerald-400 font-mono font-bold">{m.home_team?.code || 'TBD'}</span>
                                                <span className="text-slate-500 mx-1.5">vs</span>
                                                <span className="text-emerald-400 font-mono font-bold">{m.away_team?.code || 'TBD'}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono font-bold text-slate-200">
                                                {m.status === 'finished' || m.status === 'live' || m.status === 'half_time' ? (
                                                    <span>
                                                        {m.home_score} - {m.away_score}
                                                        {m.home_pens !== null && m.away_pens !== null ? ` (${m.home_pens}-${m.away_pens} p)` : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-slate-400">
                                                {m.kickoff_at ? new Date(m.kickoff_at).toLocaleString() : 'TBD'}
                                                {m.venue && <span className="block text-slate-500 text-[10px]">{m.venue}</span>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${m.status === 'live' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                                                        m.status === 'half_time' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                                            m.status === 'finished' ? 'bg-slate-800 text-slate-300' :
                                                                'bg-slate-900 border border-slate-800 text-slate-400'
                                                    }`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DeleteMatchButton matchId={m.id} />
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
