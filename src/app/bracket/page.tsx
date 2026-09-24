import Link from 'next/link';
import { getBracketMatches } from '@/lib/queries/matches';
import type { MatchWithTeams } from '@/lib/queries/matches';

export const revalidate = 30;

const ROUND_LABELS: Record<number, string> = {
    2: 'Round of 16',
    3: 'Quarter-finals',
    4: 'Semi-finals',
    5: 'Final',
};

function BracketCard({ match }: { match: MatchWithTeams }) {
    const home = match.home_team;
    const away = match.away_team;
    const isFinished = match.status === 'finished';
    const isLive = match.status === 'live' || match.status === 'half_time';

    const homeWon = isFinished && match.winner_team && match.home_team_id === match.winner_team.id;
    const awayWon = isFinished && match.winner_team && match.away_team_id === match.winner_team.id;

    return (
        <div className={`rounded-lg border overflow-hidden text-sm ${isLive ? 'border-red-700/40' : 'border-slate-800'
            }`}>
            {isLive && (
                <div className="px-2 py-0.5 bg-red-500/20 flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
                </div>
            )}
            {/* Home */}
            <div className={`flex items-center justify-between px-3 py-2 ${homeWon ? 'bg-emerald-950/30' : 'bg-slate-900'}`}>
                {home ? (
                    <Link href={`/teams/${home.code.toLowerCase()}`}
                        className={`font-semibold transition-colors ${homeWon ? 'text-emerald-300' : 'hover:text-emerald-400 text-slate-200'}`}>
                        {home.code}
                    </Link>
                ) : <span className="text-slate-500 italic">TBD</span>}
                {!isFinished || isLive ? null : (
                    <span className={`font-mono font-bold ${homeWon ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {match.home_score}
                    </span>
                )}
                {(isFinished) && (
                    <span className={`font-mono font-bold ${homeWon ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {match.home_score}
                    </span>
                )}
            </div>
            {/* Divider */}
            <div className="h-px bg-slate-800" />
            {/* Away */}
            <div className={`flex items-center justify-between px-3 py-2 ${awayWon ? 'bg-emerald-950/30' : 'bg-slate-900'}`}>
                {away ? (
                    <Link href={`/teams/${away.code.toLowerCase()}`}
                        className={`font-semibold transition-colors ${awayWon ? 'text-emerald-300' : 'hover:text-emerald-400 text-slate-200'}`}>
                        {away.code}
                    </Link>
                ) : <span className="text-slate-500 italic">TBD</span>}
                {(isFinished) && (
                    <span className={`font-mono font-bold ${awayWon ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {match.away_score}
                    </span>
                )}
            </div>
        </div>
    );
}

export default async function BracketPage() {
    const matches = await getBracketMatches();

    const byRound = new Map<number, MatchWithTeams[]>();
    for (const m of matches) {
        if (!byRound.has(m.round)) byRound.set(m.round, []);
        byRound.get(m.round)!.push(m);
    }

    const rounds = [2, 3, 4, 5];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Knockout Bracket</h1>
            <p className="text-sm text-slate-500">Rounds 2–5. Group stage tables are on the <Link href="/groups" className="text-emerald-400 hover:text-emerald-300">Groups</Link> page.</p>

            {matches.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                    Bracket not started yet. Check back after the group stage.
                </div>
            ) : (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                        {rounds.map((round) => {
                            const roundMatches = byRound.get(round) ?? [];
                            return (
                                <div key={round} className="flex flex-col gap-3 w-44">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center pb-1 border-b border-slate-800">
                                        {ROUND_LABELS[round] ?? `Round ${round}`}
                                    </div>
                                    {roundMatches.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-600">
                                            TBD
                                        </div>
                                    ) : (
                                        roundMatches.map((m) => <BracketCard key={m.id} match={m} />)
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
