import Link from 'next/link';
import { TOURNAMENT_TITLE, TOURNAMENT_SUBTITLE } from '@/lib/constants';
import { getLiveMatches, getUpcomingFixtures, getLatestResults } from '@/lib/queries/matches';
import type { MatchWithTeams } from '@/lib/queries/matches';

export const revalidate = 30;

function formatKickoff(kickoff: string | null): string {
  if (!kickoff) return 'TBD';
  return new Date(kickoff).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

function MatchCard({ match, variant }: { match: MatchWithTeams; variant: 'fixture' | 'result' | 'live' }) {
  const home = match.home_team;
  const away = match.away_team;
  const isLive = variant === 'live';

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${isLive
        ? 'bg-emerald-950/30 border-emerald-700/40'
        : 'bg-slate-900 border-slate-800'
      }`}>
      <div className="flex flex-col gap-0.5 text-sm min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {home ? (
            <Link href={`/teams/${home.code.toLowerCase()}`} className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors truncate">
              {home.code}
            </Link>
          ) : <span className="font-semibold text-slate-500">TBD</span>}
          {variant !== 'fixture' && (
            <span className="font-mono text-emerald-300 font-bold text-base shrink-0">
              {match.home_score}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {away ? (
            <Link href={`/teams/${away.code.toLowerCase()}`} className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors truncate">
              {away.code}
            </Link>
          ) : <span className="font-semibold text-slate-500">TBD</span>}
          {variant !== 'fixture' && (
            <span className="font-mono text-emerald-300 font-bold text-base shrink-0">
              {match.away_score}
            </span>
          )}
        </div>
      </div>
      <div className="text-right text-xs text-slate-400 shrink-0 ml-3">
        {variant === 'fixture' && <p>{formatKickoff(match.kickoff_at)}</p>}
        {variant === 'live' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
        {variant === 'result' && (
          <span className="text-slate-500">FT</span>
        )}
        <p className="mt-1 text-slate-500">R{match.round} {match.group ? `· Grp ${match.group.name}` : ''}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [liveMatches, upcoming, results] = await Promise.all([
    getLiveMatches(),
    getUpcomingFixtures(5),
    getLatestResults(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          {TOURNAMENT_TITLE}
        </h1>
        <p className="mt-2 text-slate-400 text-sm">{TOURNAMENT_SUBTITLE}</p>
      </div>

      {/* Live Banner */}
      {liveMatches.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-red-400">Live Now</h2>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} variant="live" />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-sm">
          <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
          No live matches right now.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Next Fixtures */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Next Fixtures</h2>
            <Link href="/fixtures" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} variant="fixture" />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4 text-center">No upcoming fixtures.</p>
          )}
        </section>

        {/* Latest Results */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Latest Results</h2>
            <Link href="/fixtures" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </Link>
          </div>
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((m) => (
                <MatchCard key={m.id} match={m} variant="result" />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4 text-center">No results yet.</p>
          )}
        </section>
      </div>

      {/* Quick links */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {[
          { href: '/groups', label: 'Group Tables', emoji: '📊' },
          { href: '/bracket', label: 'Bracket', emoji: '🏆' },
          { href: '/rankings', label: 'Rankings', emoji: '⭐' },
          { href: '/fixtures', label: 'All Fixtures', emoji: '📅' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-700/50 hover:bg-slate-800/60 transition-colors text-sm font-medium text-slate-300"
          >
            <span className="text-2xl">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
