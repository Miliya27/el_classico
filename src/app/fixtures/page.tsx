import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getFixtures } from '@/lib/queries/matches';
import type { MatchWithTeams } from '@/lib/queries/matches';

export const revalidate = 30;

interface PageProps {
    searchParams: Promise<{ round?: string; year?: string; group?: string; date?: string }>;
}

function statusBadge(status: string) {
    switch (status) {
        case 'live':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
                </span>
            );
        case 'half_time':
            return <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">HT</span>;
        case 'finished':
            return <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400">FT</span>;
        default:
            return null;
    }
}

function formatKickoff(kickoff: string | null) {
    if (!kickoff) return '—';
    return new Date(kickoff).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    });
}

function MatchRow({ match }: { match: MatchWithTeams }) {
    const home = match.home_team;
    const away = match.away_team;
    const isScheduled = match.status === 'scheduled';

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-sm">
            <div className="w-24 shrink-0 text-xs text-slate-500">{formatKickoff(match.kickoff_at)}</div>
            <div className="flex-1 flex items-center gap-2">
                {home ? (
                    <Link href={`/teams/${home.code.toLowerCase()}`} className="font-semibold hover:text-emerald-400 transition-colors">
                        {home.code}
                    </Link>
                ) : <span className="text-slate-500 font-semibold">TBD</span>}
                {!isScheduled && (
                    <span className="font-mono text-emerald-300 font-bold">
                        {match.home_score} – {match.away_score}
                        {(match.home_pens > 0 || match.away_pens > 0) && (
                            <span className="text-slate-400 text-xs ml-1">({match.home_pens}–{match.away_pens} pens)</span>
                        )}
                    </span>
                )}
                {isScheduled && <span className="text-slate-600">vs</span>}
                {away ? (
                    <Link href={`/teams/${away.code.toLowerCase()}`} className="font-semibold hover:text-emerald-400 transition-colors">
                        {away.code}
                    </Link>
                ) : <span className="text-slate-500 font-semibold">TBD</span>}
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs text-slate-500">
                {match.group && <span>Grp {match.group.name}</span>}
                {statusBadge(match.status)}
            </div>
        </div>
    );
}

export default async function FixturesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const roundParam = params.round ? parseInt(params.round, 10) : undefined;
    const yearParam = params.year ? parseInt(params.year, 10) : undefined;

    const supabase = await createClient();

    const [fixturesData, groupsData] = await Promise.all([
        getFixtures({
            round: roundParam,
            year: yearParam,
            group: params.group,
            date: params.date,
        }),
        supabase.from('groups').select('id, name, year').order('year').order('name'),
    ]);

    const groups = groupsData.data ?? [];

    // Group matches by round
    const byRound = new Map<number, MatchWithTeams[]>();
    for (const m of fixturesData) {
        if (!byRound.has(m.round)) byRound.set(m.round, []);
        byRound.get(m.round)!.push(m);
    }

    const roundLabels: Record<number, string> = {
        1: 'Round 1 – Group Stage',
        2: 'Round 2 – Round of 16',
        3: 'Round 3 – Quarter-finals',
        4: 'Round 4 – Semi-finals',
        5: 'Round 5 – Final',
    };

    const activeFilters = roundParam || yearParam || params.group || params.date;
    const buildUrl = (overrides: Record<string, string | number | undefined>) => {
        const p = new URLSearchParams();
        const merged = {
            round: roundParam?.toString(),
            year: yearParam?.toString(),
            group: params.group,
            date: params.date,
            ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, v?.toString()])),
        };
        for (const [k, v] of Object.entries(merged)) {
            if (v) p.set(k, v);
        }
        const s = p.toString();
        return `/fixtures${s ? `?${s}` : ''}`;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Fixtures & Results</h1>

            {/* Filters */}
            <div className="space-y-3">
                {/* Round filter */}
                <div className="flex flex-wrap gap-2">
                    <Link href="/fixtures" className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!roundParam ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                        All Rounds
                    </Link>
                    {[1, 2, 3, 4, 5].map((r) => (
                        <Link key={r} href={buildUrl({ round: r, year: yearParam, group: params.group, date: params.date })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${roundParam === r ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                            R{r}
                        </Link>
                    ))}
                </div>

                {/* Year filter */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 self-center">Year:</span>
                    {[undefined, 1, 2, 3, 4].map((y) => (
                        <Link key={y ?? 'all'} href={buildUrl({ round: roundParam, year: y, group: params.group, date: params.date })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${yearParam === y ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                            {y ? `Year ${y}` : 'All'}
                        </Link>
                    ))}
                </div>

                {/* Group filter (only when round 1) */}
                {(!roundParam || roundParam === 1) && groups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-slate-500 self-center">Group:</span>
                        <Link href={buildUrl({ round: roundParam, year: yearParam, group: undefined, date: params.date })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!params.group ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                            All
                        </Link>
                        {groups.map((g) => (
                            <Link key={g.id} href={buildUrl({ round: roundParam, year: yearParam, group: g.id, date: params.date })}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.group === g.id ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                                Yr{g.year} Grp {g.name}
                            </Link>
                        ))}
                    </div>
                )}

                {activeFilters && (
                    <Link href="/fixtures" className="inline-block text-xs text-rose-400 hover:text-rose-300">
                        ✕ Clear filters
                    </Link>
                )}
            </div>

            {/* Match list grouped by round */}
            {byRound.size === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">No matches found for the selected filters.</div>
            ) : (
                Array.from(byRound.entries()).map(([round, matches]) => (
                    <section key={round}>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                            {roundLabels[round] ?? `Round ${round}`}
                        </h2>
                        <div className="space-y-2">
                            {matches.map((m) => <MatchRow key={m.id} match={m} />)}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
