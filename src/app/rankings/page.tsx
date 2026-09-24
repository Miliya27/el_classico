import Link from 'next/link';
import { getTopScorers, getGoldenGlove, getBestPlayers } from '@/lib/queries/rankings';
import type { TopScorer, GoldenGlove, BestPlayer } from '@/lib/queries/rankings';

export const revalidate = 30;

interface PageProps {
    searchParams: Promise<{ year?: string; round?: string }>;
}

function buildUrl(base: string, overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(overrides)) {
        if (v) p.set(k, v);
    }
    const s = p.toString();
    return `${base}${s ? `?${s}` : ''}`;
}

function FilterBar({ yearParam, roundParam }: { yearParam?: number; roundParam?: number }) {
    return (
        <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500">Year:</span>
                {[undefined, 1, 2, 3, 4].map((y) => (
                    <Link key={y ?? 'all'} href={buildUrl('/rankings', { year: y?.toString(), round: roundParam?.toString() })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${yearParam === y ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                        {y ? `Year ${y}` : 'All'}
                    </Link>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500">Round:</span>
                {[undefined, 1, 2, 3, 4, 5].map((r) => (
                    <Link key={r ?? 'all'} href={buildUrl('/rankings', { year: yearParam?.toString(), round: r?.toString() })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${roundParam === r ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                        {r ? `R${r}` : 'All'}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function ScorerTable({ scorers }: { scorers: TopScorer[] }) {
    if (scorers.length === 0) return <EmptyState />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                        <th className="text-left px-4 py-2">#</th>
                        <th className="text-left px-2 py-2">Player</th>
                        <th className="text-left px-2 py-2">Team</th>
                        <th className="px-2 py-2 text-center">G</th>
                        <th className="px-2 py-2 text-center">A</th>
                    </tr>
                </thead>
                <tbody>
                    {scorers.map((s, i) => (
                        <tr key={s.player_id} className="border-b border-slate-800/50 last:border-0">
                            <td className="px-4 py-2.5 text-slate-500 text-sm">{i + 1}</td>
                            <td className="px-2 py-2.5 font-semibold text-slate-100">{s.player_name}</td>
                            <td className="px-2 py-2.5">
                                <Link href={`/teams/${s.team_code.toLowerCase()}`} className="text-slate-400 hover:text-emerald-400 transition-colors text-xs">
                                    {s.team_code}
                                </Link>
                            </td>
                            <td className="px-2 py-2.5 text-center font-bold text-emerald-300">{s.goals}</td>
                            <td className="px-2 py-2.5 text-center text-slate-400">{s.assists}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GloveTable({ keepers }: { keepers: GoldenGlove[] }) {
    if (keepers.length === 0) return <EmptyState />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                        <th className="text-left px-4 py-2">#</th>
                        <th className="text-left px-2 py-2">Keeper</th>
                        <th className="text-left px-2 py-2">Team</th>
                        <th className="px-2 py-2 text-center">CS</th>
                        <th className="px-2 py-2 text-center">GA</th>
                        <th className="px-2 py-2 text-center">Sv</th>
                    </tr>
                </thead>
                <tbody>
                    {keepers.map((k, i) => (
                        <tr key={k.player_id} className="border-b border-slate-800/50 last:border-0">
                            <td className="px-4 py-2.5 text-slate-500 text-sm">{i + 1}</td>
                            <td className="px-2 py-2.5 font-semibold text-slate-100">{k.player_name}</td>
                            <td className="px-2 py-2.5">
                                <Link href={`/teams/${k.team_code.toLowerCase()}`} className="text-slate-400 hover:text-emerald-400 transition-colors text-xs">
                                    {k.team_code}
                                </Link>
                            </td>
                            <td className="px-2 py-2.5 text-center font-bold text-emerald-300">{k.clean_sheets}</td>
                            <td className="px-2 py-2.5 text-center text-slate-400">{k.goals_conceded}</td>
                            <td className="px-2 py-2.5 text-center text-slate-400">{k.saves}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BestTable({ players }: { players: BestPlayer[] }) {
    if (players.length === 0) return <EmptyState />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                        <th className="text-left px-4 py-2">#</th>
                        <th className="text-left px-2 py-2">Player</th>
                        <th className="text-left px-2 py-2">Team</th>
                        <th className="px-2 py-2 text-center">MOTM</th>
                        <th className="px-2 py-2 text-center">G</th>
                        <th className="px-2 py-2 text-center">A</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((p, i) => (
                        <tr key={p.player_id} className="border-b border-slate-800/50 last:border-0">
                            <td className="px-4 py-2.5 text-slate-500 text-sm">{i + 1}</td>
                            <td className="px-2 py-2.5 font-semibold text-slate-100">{p.player_name}</td>
                            <td className="px-2 py-2.5">
                                <Link href={`/teams/${p.team_code.toLowerCase()}`} className="text-slate-400 hover:text-emerald-400 transition-colors text-xs">
                                    {p.team_code}
                                </Link>
                            </td>
                            <td className="px-2 py-2.5 text-center font-bold text-emerald-300">{p.motm_count}</td>
                            <td className="px-2 py-2.5 text-center text-slate-400">{p.goals}</td>
                            <td className="px-2 py-2.5 text-center text-slate-400">{p.assists}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState() {
    return (
        <p className="py-8 text-center text-sm text-slate-500">No data for this filter yet.</p>
    );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                <span>{emoji}</span>
                <h2 className="font-bold text-slate-100">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export default async function RankingsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const yearParam = params.year ? parseInt(params.year, 10) : undefined;
    const roundParam = params.round ? parseInt(params.round, 10) : undefined;

    const filters = { p_round: roundParam, p_year: yearParam };

    const [scorers, keepers, bestPlayers] = await Promise.all([
        getTopScorers(filters),
        getGoldenGlove(filters),
        getBestPlayers(filters),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Rankings & Awards</h1>
            <FilterBar yearParam={yearParam} roundParam={roundParam} />

            <Section title="Golden Boot" emoji="🥇">
                <ScorerTable scorers={scorers} />
            </Section>

            <Section title="Golden Glove" emoji="🧤">
                <GloveTable keepers={keepers} />
            </Section>

            <Section title="Best Player" emoji="⭐">
                <BestTable players={bestPlayers} />
            </Section>
        </div>
    );
}
