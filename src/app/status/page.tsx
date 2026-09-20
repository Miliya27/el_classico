import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StatusPage() {
    const urlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const keyConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    let overallStatus: 'Connected' | 'Error' | 'Missing configuration' = 'Connected';
    let errorMessage: string | null = null;
    let teamsCount: number | null = null;
    let matchesCount: number | null = null;
    let matchEventsCount: number | null = null;

    if (!urlConfigured || !keyConfigured) {
        overallStatus = 'Missing configuration';
        const missing: string[] = [];
        if (!urlConfigured) missing.push('NEXT_PUBLIC_SUPABASE_URL');
        if (!keyConfigured) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        errorMessage = `Missing environment variable(s): ${missing.join(', ')}`;
    } else {
        try {
            const supabase = await createClient();

            const [teamsRes, matchesRes, eventsRes] = await Promise.all([
                supabase.from('teams').select('*', { count: 'exact', head: true }),
                supabase.from('matches').select('*', { count: 'exact', head: true }),
                supabase.from('match_events').select('*', { count: 'exact', head: true }),
            ]);

            if (teamsRes.error) {
                overallStatus = 'Error';
                errorMessage = teamsRes.error.code
                    ? `[${teamsRes.error.code}] ${teamsRes.error.message}`
                    : teamsRes.error.message;
            } else if (matchesRes.error) {
                overallStatus = 'Error';
                errorMessage = matchesRes.error.code
                    ? `[${matchesRes.error.code}] ${matchesRes.error.message}`
                    : matchesRes.error.message;
            } else if (eventsRes.error) {
                overallStatus = 'Error';
                errorMessage = eventsRes.error.code
                    ? `[${eventsRes.error.code}] ${eventsRes.error.message}`
                    : eventsRes.error.message;
            } else {
                overallStatus = 'Connected';
                teamsCount = teamsRes.count ?? 0;
                matchesCount = matchesRes.count ?? 0;
                matchEventsCount = eventsRes.count ?? 0;
            }
        } catch (err: unknown) {
            overallStatus = 'Error';
            if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
                const code = String((err as { code: unknown }).code);
                const msg = String((err as { message: unknown }).message);
                errorMessage = code ? `[${code}] ${msg}` : msg;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Failed to execute query against database.';
            }
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-white">System Status</h1>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                        Part 2b Check
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-sm font-medium text-slate-300">Database Connection</span>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ${overallStatus === 'Connected'
                                        ? 'bg-emerald-400 animate-pulse'
                                        : overallStatus === 'Missing configuration'
                                            ? 'bg-amber-400'
                                            : 'bg-rose-500'
                                    }`}
                            />
                            <span
                                className={`text-sm font-semibold ${overallStatus === 'Connected'
                                        ? 'text-emerald-400'
                                        : overallStatus === 'Missing configuration'
                                            ? 'text-amber-400'
                                            : 'text-rose-400'
                                    }`}
                            >
                                {overallStatus}
                            </span>
                        </div>
                    </div>

                    {overallStatus === 'Connected' && (
                        <div className="space-y-2 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs text-slate-300">
                            <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">
                                Live Record Counts (Anon RLS Read)
                            </p>
                            <div className="flex justify-between py-1">
                                <span>Teams Count:</span>
                                <span className="font-mono font-bold text-emerald-400">{teamsCount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-t border-slate-800/50">
                                <span>Matches Count:</span>
                                <span className="font-mono font-bold text-emerald-400">{matchesCount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-t border-slate-800/50">
                                <span>Match Events Count:</span>
                                <span className="font-mono font-bold text-emerald-400">{matchEventsCount}</span>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 space-y-1">
                            <p className="font-semibold text-rose-200">Error Details:</p>
                            <p className="font-mono break-all">{errorMessage}</p>
                        </div>
                    )}
                </div>

                <div className="pt-2 text-center text-xs text-slate-500">
                    Jwala - El Classico Football Tournament App
                </div>
            </div>
        </main>
    );
}
