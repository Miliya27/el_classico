import Link from 'next/link';
import { getStandings } from '@/lib/queries/standings';

export const revalidate = 30;

export default async function GroupsPage() {
    const groups = await getStandings();

    // Collect unique years
    const years = [...new Set(groups.map((g) => g.year))].sort();

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Group Standings</h1>

            {groups.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                    Group stage has not started yet.
                </div>
            ) : (
                years.map((year) => (
                    <section key={year}>
                        <h2 className="text-base font-bold text-emerald-400 mb-4">Year {year}</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {groups
                                .filter((g) => g.year === year)
                                .map((group) => (
                                    <div key={group.group_id} className="rounded-xl border border-slate-800 overflow-hidden">
                                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                                            <h3 className="font-semibold text-sm text-slate-200">Group {group.group_name}</h3>
                                            <span className="text-xs text-slate-500">Year {group.year}</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-slate-500 border-b border-slate-800">
                                                        <th className="text-left px-4 py-2 font-medium">Team</th>
                                                        <th className="px-2 py-2 font-medium">P</th>
                                                        <th className="px-2 py-2 font-medium">W</th>
                                                        <th className="px-2 py-2 font-medium">D</th>
                                                        <th className="px-2 py-2 font-medium">L</th>
                                                        <th className="px-2 py-2 font-medium">GF</th>
                                                        <th className="px-2 py-2 font-medium">GA</th>
                                                        <th className="px-2 py-2 font-medium">GD</th>
                                                        <th className="px-2 py-2 font-medium font-bold text-slate-300">Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.rows.map((row, idx) => {
                                                        const advances = idx < 2;
                                                        const needsTiebreak = row.needs_tiebreak;
                                                        return (
                                                            <tr
                                                                key={row.team_id}
                                                                className={`border-b border-slate-800/50 last:border-0 transition-colors ${advances ? 'bg-emerald-950/20' : ''
                                                                    }`}
                                                            >
                                                                <td className="px-4 py-2.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-4 text-slate-500 text-right shrink-0">
                                                                            {row.rank ?? idx + 1}
                                                                        </span>
                                                                        {advances && (
                                                                            <span className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" title="Advances" />
                                                                        )}
                                                                        {row.code ? (
                                                                            <Link
                                                                                href={`/teams/${row.code.toLowerCase()}`}
                                                                                className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
                                                                            >
                                                                                {row.code}
                                                                            </Link>
                                                                        ) : (
                                                                            <span className="font-semibold text-slate-100">{row.name}</span>
                                                                        )}
                                                                        {needsTiebreak && (
                                                                            <span className="px-1 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                                                                                TB
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.played ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.won ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.drawn ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.lost ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.gf ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">{row.ga ?? 0}</td>
                                                                <td className="px-2 py-2.5 text-center text-slate-400">
                                                                    {(row.gd ?? 0) > 0 ? `+${row.gd}` : row.gd ?? 0}
                                                                </td>
                                                                <td className="px-2 py-2.5 text-center font-bold text-slate-100">
                                                                    {row.points ?? 0}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))
            )}

            {/* Legend */}
            {groups.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1 h-4 rounded-full bg-emerald-500" />
                        Advances to Round 2
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">TB</span>
                        Tiebreak required
                    </div>
                </div>
            )}
        </div>
    );
}
