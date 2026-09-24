'use client';

import { useState } from 'react';
import { createTeamAction, updateTeamAction, deleteTeamAction } from './actions';
import type { Tables } from '@/types/database';

interface GroupItem {
    id: string;
    name: string;
    year: number;
}

interface TeamWithGroup extends Tables<'teams'> {
    group?: GroupItem | null;
    player_count?: number;
    match_count?: number;
}

interface TeamFormProps {
    groups: GroupItem[];
    teamToEdit?: TeamWithGroup | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function TeamForm({ groups, teamToEdit, onSuccess, onCancel }: TeamFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(teamToEdit);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = isEdit && teamToEdit
            ? await updateTeamAction(teamToEdit.id, formData)
            : await createTeamAction(formData);

        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            if (onSuccess) onSuccess();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">
                {isEdit ? `Edit Team: ${teamToEdit?.code}` : 'Add New Team'}
            </h3>

            {error && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Team Code (Unique, e.g. ECA1)
                    </label>
                    <input
                        name="code"
                        type="text"
                        required
                        defaultValue={teamToEdit?.code ?? ''}
                        placeholder="ECA1"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Team Name
                    </label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={teamToEdit?.name ?? ''}
                        placeholder="ECA Semester 1"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Year (1 to 4)
                    </label>
                    <input
                        name="year"
                        type="number"
                        min={1}
                        max={4}
                        required
                        defaultValue={teamToEdit?.year ?? 1}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Batch (Optional, e.g. 2026)
                    </label>
                    <input
                        name="batch"
                        type="text"
                        defaultValue={teamToEdit?.batch ?? ''}
                        placeholder="2026"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Assigned Group
                    </label>
                    <select
                        name="group_id"
                        defaultValue={teamToEdit?.group_id ?? ''}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- Unassigned --</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                                Year {g.year} · Group {g.name}
                            </option>
                        ))}
                    </select>
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
                    {loading ? 'Saving...' : isEdit ? 'Update Team' : 'Create Team'}
                </button>
            </div>
        </form>
    );
}

export function EditTeamButton({ team, groups }: { team: TeamWithGroup; groups: GroupItem[] }) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <TeamForm
                            groups={groups}
                            teamToEdit={team}
                            onSuccess={() => setEditing(false)}
                            onCancel={() => setEditing(false)}
                        />
                    </div>
                </div>
            </>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors"
        >
            Edit
        </button>
    );
}

export function DeleteTeamButton({ teamId, teamCode }: { teamId: string; teamCode: string }) {
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setError(null);
        setLoading(true);
        const res = await deleteTeamAction(teamId);
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
                    <span className="text-xs text-rose-400">Delete {teamCode}?</span>
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
