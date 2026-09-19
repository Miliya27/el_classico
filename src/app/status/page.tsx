import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function StatusPage() {
    const urlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const keyConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    let isConnected = false
    let errorMessage: string | null = null

    if (!urlConfigured || !keyConfigured) {
        errorMessage = 'Supabase environment variables are missing in .env.local.'
    } else {
        try {
            const supabase = await createClient()
            const { error } = await supabase.auth.getSession()
            if (error) {
                errorMessage = `Supabase auth session error: ${error.message}`
            } else {
                isConnected = true
            }
        } catch (err: unknown) {
            errorMessage = err instanceof Error ? err.message : 'Unknown connection error'
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-white">System Status</h1>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                        Part 1 Check
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-sm font-medium text-slate-300">Supabase Connection</span>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                                    }`}
                            />
                            <span
                                className={`text-sm font-semibold ${isConnected ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                            >
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                        <div className="flex justify-between py-1 border-b border-slate-800/50">
                            <span>NEXT_PUBLIC_SUPABASE_URL</span>
                            <span className={urlConfigured ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                                {urlConfigured ? 'Configured' : 'Missing'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/50">
                            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                            <span className={keyConfigured ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                                {keyConfigured ? 'Configured' : 'Missing'}
                            </span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 space-y-1">
                            <p className="font-semibold text-rose-200">Connection Note:</p>
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {isConnected && (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300">
                            ✓ Successfully connected to Supabase backend services.
                        </div>
                    )}
                </div>

                <div className="pt-2 text-center text-xs text-slate-500">
                    Jwala - El Classico Football Tournament App
                </div>
            </div>
        </main>
    )
}
