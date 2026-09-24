import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeamByCode, getTeamMatches } from '@/lib/queries/teams';
import type { TeamMatch } from '@/lib/queries/teams';

export const revalidate = 30;

interface PageProps {
    params: Promise<{ code: string }>;
}

function formatKickoff(kickoff: string | null) {
    if (!kickoff) return 'TBD';
    return new Date(kickoff).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    });
}

function matchResult(match: TeamMatch, teamId: string) {
    const isHome = match.home_team_id === teamId;
    const myScore = isHome ? match.home_score : match.away_score;
    const oppScore = isHome ? match.away_score : match.home_score;
    const opp = isHome ? match.away_team : match.home_team;

    if (match.status !== 'finished') {
        return { label: '—', color: 'text-slate-500', opp, myScore, oppScore };
    }

    if (myScore > oppScore) return { label: 'W', color: 'text-emerald-400', opp, myScore, oppScore };
    if (myScore < oppScore) return { label: 'L', color: 'text-rose-400', opp, myScore, oppScore };
    return { label: 'D', color: 'text-amber-400', opp, myScore, oppScore };
}

export default async function TeamPage({ params }: PageProps) {
    const { code } = await params;
    const team = await getTeamByCode(code);

    if (!team) notFound();

    const matches = await getTeamMatches(team.id);

    const ROUND_LABELS: Record<number, string> = {
        1: 'Group Stage',
        2: 'Round of 16',
        3: 'Quarter-final',
        4: 'Semi-final',
        5: 'Final',
    };

    const gkList = team.players.filter((p) => p.is_gk);
    const outfieldList = team.players.filter((p) => !p.is_gk);

    return (
        <div className="space-y-8">
            {/* Team Header */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">
                            Year {team.year ?? '—'} {team.batch ? `· ${team.batch}` : ''}
                        </p>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-50">{team.name}</h1>
                        <p className="text-slate-500 text-sm font-mono mt-1">{team.code}</p>
                    </div>
                    {team.group && (
                        <Link href="/groups" className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 text-xs font-semibold">
                            Group {team.group.name}
                        </Link>
                    )}
                </div>
            </div>

            {/* Players Roster */}
            <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">Roster</h2>
                {team.players.length === 0 ? (
                    <p className="text-sm text-slate-500">No players registered yet.</p>
                ) : (
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-500 border-b border-slate-800 bg-slate-900">
                                    <th className="text-left px-4 py-2.5 font-medium">No.</th>
                                    <th className="text-left px-2 py-2.5 font-medium">Name</th>
                                    <th className="text-left px-2 py-2.5 font-medium">Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gkList.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-800/50">
                                        <td className="px-4 py-2.5 text-slate-500 font-mono">
                                            {p.jersey_no ?? '—'}
                                        </td>
                                        <td className="px-2 py-2.5 font-semibold text-slate-100">{p.name}</td>
                                        <td className="px-2 py-2.5">
                                            <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">GK</span>
                                        </td>
                                    </tr>
                                ))}
                                {outfieldList.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-800/50 last:border-0">
                                        <td className="px-4 py-2.5 text-slate-500 font-mono">
                                            {p.jersey_no ?? '—'}
                                        </td>
                                        <td className="px-2 py-2.5 font-semibold text-slate-100">{p.name}</td>
                                        <td className="px-2 py-2.5 text-xs text-slate-500">Outfield</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Match History */}
            <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">Fixtures & Results</h2>
                {matches.length === 0 ? (
                    <p className="text-sm text-slate-500">No matches scheduled yet.</p>
                ) : (
                    <div className="space-y-2">
                        {matches.map((m) => {
                            const { label, color, opp, myScore, oppScore } = matchResult(m, team.id);
                            return (
                                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-sm">
                                    <span className={`w-6 text-center font-bold shrink-0 ${color}`}>{label}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-slate-400 text-xs">{ROUND_LABELS[m.round] ?? `R${m.round}`}</span>
                                        {m.group && <span className="text-slate-500 text-xs"> · Grp {m.group.name}</span>}
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-slate-200 font-semibold">vs </span>
                                            {opp ? (
                                                <Link href={`/teams/${opp.code.toLowerCase()}`} className="font-semibold text-slate-200 hover:text-emerald-400 transition-colors">
                                                    {opp.code}
                                                </Link>
                                            ) : <span className="text-slate-500">TBD</span>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {m.status === 'finished' || m.status === 'live' || m.status === 'half_time' ? (
                                            <span className="font-mono font-bold text-slate-50">
                                                {myScore}–{oppScore}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">{formatKickoff(m.kickoff_at)}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
