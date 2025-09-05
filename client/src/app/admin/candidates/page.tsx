'use client';

import { useCandidateStatistics, useModerationQueue, useCreateCandidate, useCandidates, useUpdateCandidate, useDeleteCandidate } from '@/services/client/api';
import { UserCheck, AlertTriangle, Image, FileText, Eye, Edit, Trash2, Plus, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import React from 'react';
import AsyncSelect from '@/components/ui/async-select';
import { searchPositions, searchStudents } from '@/services/server/api';

interface LocalFormState { position: string; bio: string; alias: string; photo: File | null; overrideStudent?: string | null }

export default function CandidatesPage() {
    const { data: statistics, isLoading: statsLoading } = useCandidateStatistics();
    const { data: moderationQueue, isLoading: queueLoading } = useModerationQueue();
    const { data: candidatesList, isLoading: listLoading } = useCandidates();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Candidates Management</h1>
                    <p className="text-white/60 mt-1">Monitor candidate profiles and moderate content</p>
                </div>
                <div className="flex gap-3">
                    <NewCandidateButton />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                            <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Total Candidates</p>
                            <p className="text-2xl font-bold text-white">
                                {statsLoading ? '...' : statistics?.data?.total_candidates || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Complete Profiles</p>
                            <p className="text-2xl font-bold text-white">
                                {statsLoading ? '...' : statistics?.data?.complete_profiles || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600">
                            <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Need Attention</p>
                            <p className="text-2xl font-bold text-white">
                                {queueLoading ? '...' : moderationQueue?.data?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                            <Image className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Completion Rate</p>
                            <p className="text-2xl font-bold text-white">
                                {statsLoading ? '...' : `${statistics?.data?.completion_rate || 0}%`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidates Grid */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold text-white">All Candidates</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30">
                        {candidatesList?.data?.length || 0}
                    </span>
                </div>
                {listLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-white/10 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {candidatesList?.data?.map((c: any) => <CandidateCard key={c.id} candidate={c} />)}
                    </div>
                )}
            </div>

            {/* Moderation Queue */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <h2 className="text-xl font-semibold text-white">Moderation Queue</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-400/30">
                        {moderationQueue?.data?.length || 0} items
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="text-left p-4 font-medium text-white/70">Candidate</th>
                                <th className="text-left p-4 font-medium text-white/70">Position</th>
                                <th className="text-left p-4 font-medium text-white/70">Election</th>
                                <th className="text-left p-4 font-medium text-white/70">Issues</th>
                                <th className="text-left p-4 font-medium text-white/70">Created</th>
                                <th className="text-left p-4 font-medium text-white/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queueLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/10">
                                        <td className="p-4"><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : moderationQueue?.data?.map((candidate) => (
                                <tr key={candidate.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-white">{candidate.student_name}</div>
                                            <div className="text-sm text-white/60 font-mono">{candidate.student_matric}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{candidate.position}</td>
                                    <td className="p-4 text-white/70">{candidate.election}</td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {candidate.missing_bio && (
                                                <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-400/30">
                                                    No Bio
                                                </span>
                                            )}
                                            {candidate.missing_photo && (
                                                <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-400/30">
                                                    No Photo
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/70">
                                        {format(new Date(candidate.created_at), 'MMM dd')}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all" title="Preview">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 hover:bg-amber-500/30 transition-all" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// New Candidate Button + Modal
const NewCandidateButton: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const [form, setForm] = React.useState<LocalFormState>({ position: '', bio: '', alias: '', photo: null, overrideStudent: null });
    const createMutation = useCreateCandidate();
    const [preview, setPreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setForm(f => ({ ...f, photo: file || null }));
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }
    };

    const submit = async () => {
        if (!form.position) return;
        await createMutation.mutateAsync({ position: form.position, bio: form.bio || undefined, alias: form.alias || undefined, photo: form.photo || undefined, student_id: form.overrideStudent || undefined });
        setOpen(false);
        setForm({ position: '', bio: '', alias: '', photo: null, overrideStudent: null });
        setPreview(null);
    };

    return (
        <>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow hover:from-indigo-600 hover:to-purple-700 transition">
                <Plus className="h-4 w-4" /> New Candidate
            </button>
            {open && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative z-50 w-full max-w-lg rounded-2xl bg-white/10 border border-white/20 p-6 space-y-5 text-white">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Create Candidate Profile</h3>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Position</label>
                                <AsyncSelect
                                    value={form.position || null}
                                    onChange={(val) => setForm(f => ({ ...f, position: val || '' }))}
                                    placeholder="Search positions..."
                                    fetcher={async (q, page) => {
                                        const res = await searchPositions(q, { page, limit: 10 });
                                        return { results: res.data?.results || [], has_next: res.data?.has_next };}}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium flex items-center gap-2">Override Student (Admin)</label>
                                <AsyncSelect
                                    value={form.overrideStudent || null}
                                    onChange={(val) => setForm(f => ({ ...f, overrideStudent: val }))}
                                    placeholder="Search students (optional)..."
                                    fetcher={async (q, page) => { const res = await searchStudents(q, { page, limit: 10 }); return { results: res.data?.results || [], has_next: res.data?.has_next }; }}
                                />
                                <p className="text-xs text-white/40">Leave empty to use your own account.</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Alias (optional)</label>
                                <input value={form.alias} onChange={e => setForm(f => ({ ...f, alias: e.target.value }))} maxLength={100} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Bio</label>
                                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <p className="text-xs text-white/50 text-right">{form.bio.length}/2000</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                                        {preview ? (
                                            <img src={preview} alt="preview" className="object-cover w-full h-full" />
                                        ) : (
                                            <Image className="h-8 w-8 text-white/40" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input ref={fileInputRef} onChange={onFileChange} type="file" accept="image/*" className="hidden" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition">Select</button>
                                            {form.photo && (
                                                <button type="button" onClick={() => { setForm(f => ({ ...f, photo: null })); setPreview(null); if (fileInputRef.current) fileInputRef.current.value=''; }} className="px-3 py-2 rounded-lg bg-red-600/80 text-white text-sm font-medium hover:bg-red-600 transition">Remove</button>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/50">JPEG/PNG/WEBP up to 3MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium">Cancel</button>
                            <button disabled={createMutation.isPending || !form.position} onClick={submit} className={cn("px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition shadow", (createMutation.isPending || !form.position) && 'opacity-50 cursor-not-allowed')}>{createMutation.isPending ? 'Creating...' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Candidate card with edit/delete
const CandidateCard: React.FC<{ candidate: any }> = ({ candidate }) => {
    const [editing, setEditing] = React.useState(false);
    const [alias, setAlias] = React.useState(candidate.alias || '');
    const [bio, setBio] = React.useState(candidate.bio || '');
    const updateMutation = useUpdateCandidate(candidate.id);
    const deleteMutation = useDeleteCandidate();

    const save = async () => {
        await updateMutation.mutateAsync({ alias, bio });
        setEditing(false);
    };
    const remove = async () => {
        if (confirm('Delete candidate?')) {
            await deleteMutation.mutateAsync(candidate.id);
        }
    };
    return (
        <div className="rounded-xl bg-white/5 border border-white/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                    {candidate.photo ? <img src={candidate.photo} className="object-cover w-full h-full" /> : <span className="text-white/40 text-xs">No Photo</span>}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-white text-sm leading-tight">{candidate.student.full_name}</div>
                    <div className="text-xs text-white/50">{candidate.position_name}</div>
                    <div className="text-xs text-white/40">{candidate.election_name}</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setEditing(e=>!e)} className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 hover:bg-amber-500/30"><Edit className="h-4 w-4" /></button>
                    <button onClick={remove} className="p-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
            {editing ? (
                <div className="space-y-2">
                    <input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="Alias" className="w-full px-2 py-1 text-sm rounded bg-white/10 border border-white/20 focus:outline-none" />
                    <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} placeholder="Bio" className="w-full px-2 py-1 text-sm rounded bg-white/10 border border-white/20 focus:outline-none resize-none" />
                    <div className="flex gap-2">
                        <button onClick={()=>setEditing(false)} className="flex-1 px-3 py-1 rounded bg-white/10 text-xs">Cancel</button>
                        <button disabled={updateMutation.isPending} onClick={save} className="flex-1 px-3 py-1 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs disabled:opacity-50">{updateMutation.isPending ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>
            ) : candidate.bio ? (
                <p className="text-xs text-white/60 line-clamp-3">{candidate.bio}</p>
            ) : (
                <p className="text-xs text-white/30 italic">No bio</p>
            )}
        </div>
    );
};
