'use client';

import { useState } from 'react';
import { useVotingLogs, useExportVotes } from '@/services/client/api';
import { Search, Filter, Download, Calendar, Clock, User, Vote as VoteIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function VotesPage() {
    const [filters, setFilters] = useState({
        election: '',
        position: '',
        date_from: '',
        date_to: '',
        page: 1,
        page_size: 20
    });

    const { data: votingLogs, isLoading } = useVotingLogs(filters);
    const { mutate: exportVotes, isPending: isExporting } = useExportVotes();

    const handleExport = () => {
        exportVotes(filters.election || undefined, {
            onSuccess: (blob) => {
                if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `votes_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Votes exported successfully');
                } else {
                    toast.error('Failed to export votes');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Voting Activity</h1>
                    <p className="text-white/60 mt-1">Monitor all voting activity and export data</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-400 hover:bg-green-500/30 transition-all"
                >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                        value={filters.election}
                        onChange={(e) => setFilters(prev => ({ ...prev, election: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                    >
                        <option value="">All Elections</option>
                        {/* Add election options */}
                    </select>
                    <select
                        value={filters.position}
                        onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                    >
                        <option value="">All Positions</option>
                        {/* Add position options */}
                    </select>
                    <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        placeholder="From Date"
                    />
                    <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        placeholder="To Date"
                    />
                    <div className="flex items-center gap-2 text-white/70">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">
                            {votingLogs?.data?.length || 0} votes
                        </span>
                    </div>
                </div>
            </div>

            {/* Voting Activity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                            <VoteIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Total Votes Today</p>
                            <p className="text-2xl font-bold text-white">247</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Active Voters</p>
                            <p className="text-2xl font-bold text-white">156</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Votes/Hour</p>
                            <p className="text-2xl font-bold text-white">23</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Participation</p>
                            <p className="text-2xl font-bold text-white">78%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voting Logs Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="text-left p-4 font-medium text-white/70">Voter</th>
                                <th className="text-left p-4 font-medium text-white/70">Candidate</th>
                                <th className="text-left p-4 font-medium text-white/70">Position</th>
                                <th className="text-left p-4 font-medium text-white/70">Election</th>
                                <th className="text-left p-4 font-medium text-white/70">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/10">
                                        <td className="p-4"><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : votingLogs?.data?.map((log) => (
                                <tr key={log.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-white">{log.voter_name}</div>
                                            <div className="text-sm text-white/60 font-mono">{log.voter_matric}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-white">{log.candidate_name}</div>
                                            <div className="text-sm text-white/60 font-mono">{log.candidate_matric}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{log.position}</td>
                                    <td className="p-4 text-white/70">{log.election}</td>
                                    <td className="p-4">
                                        <div className="text-white">
                                            {format(new Date(log.voted_at), 'MMM dd')}
                                        </div>
                                        <div className="text-sm text-white/60">
                                            {format(new Date(log.voted_at), 'HH:mm')}
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
