import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/AdminNav';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{
        page?: string;
    }>;
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
    const { user, admin } = await requireAdmin();
    const params = await searchParams;
    const pageNum = parseInt(params.page || '1', 10);
    const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const pageSize = 25;

    const supabase = await createClient();

    // 1. Fetch total count of audit logs
    const { count: totalCount } = await supabase
        .from('audit_log')
        .select('id', { count: 'exact', head: true });

    const total = totalCount ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    // 2. Query audit logs newest first
    const { data: rawLogs, error: logError } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(fromIndex, toIndex);

    if (logError) {
        console.error('Audit log fetch error:', logError);
    }

    const logs = rawLogs ?? [];

    // 3. Attempt to fetch user emails from auth.users (User attempt requirement)
    const userEmailMap = new Map<string, string>();
    let emailJoinAccessible = false;

    try {
        const userIds = Array.from(new Set(logs.map((l) => l.user_id).filter((id): id is string => Boolean(id))));
        if (userIds.length > 0) {
            const authClient = supabase as unknown as {
                schema: (s: string) => {
                    from: (t: string) => {
                        select: (c: string) => {
                            in: (col: string, vals: string[]) => Promise<{ data: { id: string; email: string }[] | null; error: unknown }>;
                        };
                    };
                };
            };
            const { data: userData, error: userError } = await authClient
                .schema('auth')
                .from('users')
                .select('id, email')
                .in('id', userIds);

            if (!userError && userData && userData.length > 0) {
                emailJoinAccessible = true;
                for (const u of userData) {
                    if (u.id && u.email) {
                        userEmailMap.set(u.id, u.email);
                    }
                }
            }
        }
    } catch {
        // auth.users is protected by Postgres security privileges for anon/authenticated roles
        emailJoinAccessible = false;
    }

    return (
        <div className="space-y-6">
            <AdminNav displayName={admin.display_name} email={user.email} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                            Audit Log
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Immutable audit records for database modifications ({total} total entries)
                        </p>
                    </div>

                    {!emailJoinAccessible && (
                        <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                            Note: <code className="text-slate-300 font-mono">auth.users</code> direct query is restricted for standard authenticated RLS caller; displaying <code className="text-slate-300 font-mono">user_id</code> fallback.
                        </div>
                    )}
                </div>

                {/* Audit Log Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-100">
                            Audit Trail (Page {page} of {totalPages})
                        </h2>
                    </div>

                    {logs.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">
                            No audit log entries recorded yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 text-left bg-slate-950/50">
                                        <th className="px-4 py-3 font-semibold">Timestamp</th>
                                        <th className="px-3 py-3 font-semibold">Action</th>
                                        <th className="px-3 py-3 font-semibold">Table</th>
                                        <th className="px-3 py-3 font-semibold">Record ID</th>
                                        <th className="px-3 py-3 font-semibold">User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const email = log.user_id ? userEmailMap.get(log.user_id) : null;
                                        return (
                                            <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-850 transition-colors">
                                                <td className="px-4 py-3 font-mono text-slate-400">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${log.action === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                        log.action === 'UPDATE' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                                                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 font-mono font-semibold text-slate-200">
                                                    {log.table_name}
                                                </td>
                                                <td className="px-3 py-3 font-mono text-slate-400 truncate max-w-[150px]" title={log.record_id || undefined}>
                                                    {log.record_id ? `${log.record_id.substring(0, 8)}...` : '—'}
                                                </td>
                                                <td className="px-3 py-3 font-mono text-slate-300">
                                                    {email ? (
                                                        <span className="text-emerald-400 font-sans font-medium">{email}</span>
                                                    ) : log.user_id ? (
                                                        <span title={log.user_id}>{log.user_id.substring(0, 8)}...</span>
                                                    ) : (
                                                        <span className="text-slate-500">System</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                Showing {fromIndex + 1}–{Math.min(toIndex + 1, total)} of {total} logs
                            </span>
                            <div className="flex items-center gap-2">
                                {page > 1 ? (
                                    <Link
                                        href={`/admin/audit?page=${page - 1}`}
                                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                                    >
                                        ← Previous
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed">
                                        ← Previous
                                    </span>
                                )}
                                <span className="text-slate-400 px-2 font-mono">
                                    {page} / {totalPages}
                                </span>
                                {page < totalPages ? (
                                    <Link
                                        href={`/admin/audit?page=${page + 1}`}
                                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                                    >
                                        Next →
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed">
                                        Next →
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
