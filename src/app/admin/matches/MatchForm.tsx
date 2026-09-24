'use client';

import { useState } from 'react';
import { createMatchAction, updateMatchAction, deleteMatchAction } from './actions';
import type { Tables } from '@/types/database';

interface GroupOption {
    id: string;
    name: string;
    year: number;
}

interface TeamOption {
    id: string;
    code: string;
    name: string;
    year: number;
}

interface MatchWithTeams extends Tables<'matches'> {
    home_team?: TeamOption | null;
    away_team?: TeamOption | null;
    group?: GroupOption | null;
}

interface MatchFormProps {
    teams: TeamOption[];
    groups: GroupOption[];
    matchToEdit?: MatchWithTeams | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function formatDatetimeLocal(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MatchForm({ teams, groups, matchToEdit, onSuccess, onCancel }: MatchFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(matchToEdit);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = isEdit && matchToEdit
            ? await updateMatchAction(matchToEdit.id, formData)
            : await createMatchAction(formData);

        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            if (onSuccess) onSuccess();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
                {isEdit ? `Edit Fixture (ID: ${matchToEdit?.id.substring(0, 8)}...)` : 'Schedule New Match'}
            </h3>

            {error && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Round (1 to 5)
                    </label>
                    <select
                        name="round"
                        required
                        defaultValue={matchToEdit?.round ?? 1}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value={1}>Round 1 – Group Stage</option>
                        <option value={2}>Round 2 – Round of 16</option>
                        <option value={3}>Round 3 – Quarter-final</option>
                        <option value={4}>Round 4 – Semi-final</option>
                        <option value={5}>Round 5 – Final</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Year (Rounds 1–2)
                    </label>
                    <select
                        name="year"
                        defaultValue={matchToEdit?.year ?? 1}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">None (Knockouts R3-5)</option>
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Group (Required for R1)
                    </label>
                    <select
                        name="group_id"
                        defaultValue={matchToEdit?.group_id ?? ''}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- No Group --</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                                Year {g.year} · Group {g.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Home Team
                    </label>
                    <select
                        name="home_team_id"
                        required
                        defaultValue={matchToEdit?.home_team_id ?? ''}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- Select Home Team --</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.code} · {t.name} (Yr {t.year})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Away Team
                    </label>
                    <select
                        name="away_team_id"
                        required
                        defaultValue={matchToEdit?.away_team_id ?? ''}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- Select Away Team --</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.code} · {t.name} (Yr {t.year})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Kickoff Time
                    </label>
                    <input
                        name="kickoff_at"
                        type="datetime-local"
                        defaultValue={formatDatetimeLocal(matchToEdit?.kickoff_at ?? null)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Venue (Optional)
                    </label>
                    <input
                        name="venue"
                        type="text"
                        defaultValue={matchToEdit?.venue ?? ''}
                        placeholder="Main Football Ground"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-500 italic">
                    Scores are derived automatically from match events (Part 5 live panel). Status transitions are managed during live control.
                </p>
                <div className="flex items-center gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update Fixture' : 'Schedule Match'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export function DeleteMatchButton({ matchId }: { matchId: string }) {
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setError(null);
        setLoading(true);
        const res = await deleteMatchAction(matchId);
        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            setConfirming(false);
        }
    }

    return (
        <div>
            {error && (
                <div className="mb-2 p-2 bg-rose-500/20 border border-rose-500/30 rounded text-rose-300 text-xs font-semibold">
                    {error}
                </div>
            )}
            {!confirming ? (
                <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 transition-colors"
                >
                    Delete
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-400">Delete Match?</span>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleDelete}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        onClick={() => { setConfirming(false); setError(null); }}
                        className="px-2 py-0.5 rounded text-xs text-slate-400 hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
