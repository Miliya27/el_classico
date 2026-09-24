import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';

export const revalidate = 0; // Fresh admin dashboard stats on every visit

export default async function AdminDashboardPage() {
    const { user, admin } = await requireAdmin();
    const supabase = await createClient();

    const [teamsRes, playersRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id, status'),
    ]);

    const teamCount = teamsRes.count ?? 0;
    const playerCount = playersRes.count ?? 0;

    const matches = matchesRes.data ?? [];
    const scheduledMatches = matches.filter((m) => m.status === 'scheduled').length;
    const liveMatches = matches.filter((m) => m.status === 'live' || m.status === 'half_time').length;
    const finishedMatches = matches.filter((m) => m.status === 'finished').length;
    const totalMatches = matches.length;

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                    <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                        Welcome back, {admin.display_name || user.email || 'Admin'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Tournament Management Console for Jwala - El Classico
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Teams</span>
                        <span className="text-3xl font-extrabold text-slate-100">{teamCount}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Players</span>
                        <span className="text-3xl font-extrabold text-slate-100">{playerCount}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Live / Total</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-emerald-400">{liveMatches}</span>
                            <span className="text-sm font-semibold text-slate-400">/ {totalMatches}</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Finished / Scheduled</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-200">{finishedMatches}</span>
                            <span className="text-xs text-slate-400">FT</span>
                            <span className="text-xl font-bold text-slate-400 ml-2">{scheduledMatches}</span>
                            <span className="text-xs text-slate-400">Sch</span>
                        </div>
                    </div>
                </div>

                {/* Admin Section Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href="/admin/teams"
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <span className="text-3xl mb-3 block">🛡️</span>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                Manage Teams
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Add, edit, or delete competing teams, codes, years, and group assignments.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                            Go to Teams →
                        </span>
                    </Link>

                    <Link
                        href="/admin/players"
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <span className="text-3xl mb-3 block">⚽</span>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                Manage Players
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Manage rosters, jersey numbers, and designated goalkeepers.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                            Go to Players →
                        </span>
                    </Link>

                    <Link
                        href="/admin/groups"
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <span className="text-3xl mb-3 block">📊</span>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                View Groups
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                View tournament group allocations (8 groups across Years 1–4).
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                            Go to Groups →
                        </span>
                    </Link>

                    <Link
                        href="/admin/matches"
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <span className="text-3xl mb-3 block">📅</span>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                Manage Matches & Fixtures
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Schedule fixtures, update kickoff times, venues, and team matchups.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                            Go to Matches →
                        </span>
                    </Link>

                    <Link
                        href="/admin/audit"
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <span className="text-3xl mb-3 block">📜</span>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                Audit Log
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Review immutable database audit events, user actions, and timestamps.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                            Go to Audit Log →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
