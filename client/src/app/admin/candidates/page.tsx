'use client';

import { useCandidateStatistics, useModerationQueue } from '@/services/client/api';
import { UserCheck, AlertTriangle, Image, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CandidatesPage() {
    const { data: statistics, isLoading: statsLoading } = useCandidateStatistics();
    const { data: moderationQueue, isLoading: queueLoading } = useModerationQueue();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Candidates Management</h1>
                    <p className="text-white/60 mt-1">Monitor candidate profiles and moderate content</p>
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
                                            <button className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 hover:bg-amber-500/30 transition-all">
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
