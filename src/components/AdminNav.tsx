import Link from 'next/link';
import { signOutAction } from '@/app/auth/actions';

interface AdminNavProps {
    displayName?: string | null;
    email?: string | null;
}

export function AdminNav({ displayName, email }: AdminNavProps) {
    return (
        <header className="bg-slate-900 border-b border-slate-800 text-slate-100 mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="font-extrabold text-base tracking-tight text-emerald-400 hover:text-emerald-300 transition-colors">
                        Admin Console
                    </Link>
                    <nav className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                        <Link href="/admin/teams" className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            Teams
                        </Link>
                        <Link href="/admin/players" className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            Players
                        </Link>
                        <Link href="/admin/groups" className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            Groups
                        </Link>
                        <Link href="/admin/matches" className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            Matches
                        </Link>
                        <Link href="/admin/audit" className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            Audit Log
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                        Signed in as <strong className="text-slate-200 font-semibold">{displayName || email || 'Admin'}</strong>
                    </span>
                    <form action={signOutAction}>
                        <button
                            type="submit"
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
