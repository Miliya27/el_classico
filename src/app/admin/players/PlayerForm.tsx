'use client';

import { useState } from 'react';
import { createPlayerAction, updatePlayerAction, deletePlayerAction } from './actions';
import type { Tables } from '@/types/database';

interface TeamOption {
    id: string;
    code: string;
    name: string;
    year: number;
}

interface PlayerWithTeam extends Tables<'players'> {
    team?: TeamOption | null;
}

interface PlayerFormProps {
    teams: TeamOption[];
    selectedTeamId?: string;
    playerToEdit?: PlayerWithTeam | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function PlayerForm({ teams, selectedTeamId, playerToEdit, onSuccess, onCancel }: PlayerFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(playerToEdit);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = isEdit && playerToEdit
            ? await updatePlayerAction(playerToEdit.id, formData)
            : await createPlayerAction(formData);

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
                {isEdit ? `Edit Player: ${playerToEdit?.name}` : 'Add New Player'}
            </h3>

            {error && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Player Name
                    </label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={playerToEdit?.name ?? ''}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Team
                    </label>
                    <select
                        name="team_id"
                        required
                        defaultValue={playerToEdit?.team_id ?? selectedTeamId ?? ''}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- Select Team --</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.code} · {t.name} (Year {t.year})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Jersey Number (Optional)
                    </label>
                    <input
                        name="jersey_no"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={playerToEdit?.jersey_no ?? ''}
                        placeholder="10"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-200">
                        <input
                            name="is_gk"
                            type="checkbox"
                            defaultChecked={playerToEdit?.is_gk ?? false}
                            className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Designated Goalkeeper (GK)</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
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
                    {loading ? 'Saving...' : isEdit ? 'Update Player' : 'Add Player'}
                </button>
            </div>
        </form>
    );
}

export function DeletePlayerButton({ playerId, playerName }: { playerId: string; playerName: string }) {
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setError(null);
        setLoading(true);
        const res = await deletePlayerAction(playerId);
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
                    <span className="text-xs text-rose-400">Remove {playerName}?</span>
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
