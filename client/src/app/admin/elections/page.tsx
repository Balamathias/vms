'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getElection, getElections, getVotingLogs } from '@/services/server/api';
import { Calendar, Plus, Eye, Edit, Play, Pause, Trophy, Users, Vote, BarChart3, X, Clock, Filter } from 'lucide-react';
import { Election } from '@/@types/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { QUERY_KEYS, useCreateElection, useToggleElectionStatus, useUpdateElection } from '@/services/client/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ElectionFormData {
    name: string;
    start_date: string;
    end_date: string;
    type?: 'general' | 'specific';
}

export default function ElectionsPage() {

    const searchParams = useSearchParams()
    const [showCreateModal, setShowCreateModal] = useState(Boolean(searchParams.get('create')) || false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingElection, setEditingElection] = useState<Election | null>(null);
    const [viewingElection, setViewingElection] = useState<Election | null>(null);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [ordering, setOrdering] = useState<string>('-start_date');
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(15);

    const { data: electionsData, isLoading, isFetching } = useQuery({
        queryKey: ['elections', { search, typeFilter, statusFilter, ordering, page, pageSize }],
        queryFn: () => getElections({
            q: search || undefined,
            type: typeFilter && typeFilter !== 'any' ? (typeFilter as 'general' | 'specific') : undefined,
            is_active: statusFilter === '' || statusFilter === 'any' ? undefined : statusFilter === 'active',
            ordering,
            page,
            page_size: pageSize,
        })
    });

    const elections = electionsData?.data || [];
    const total = electionsData?.count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(()=>{ if(page>totalPages) setPage(totalPages); },[totalPages,page]);

    const createElectionMutation = useCreateElection();
    const updateElectionMutation = useUpdateElection();
    const toggleElectionMutation = useToggleElectionStatus()

    const handleEditElection = (election: Election) => {
        setEditingElection(election);
        setShowEditModal(true);
    };

    const handleViewElection = (election: Election) => {
        setViewingElection(election);
        setShowViewModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Elections Management</h1>
                    <p className="text-white/60 mt-1">Create and manage elections</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Create Election
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-white/70" />
                        <span className="text-white/70 text-sm">Filters:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 text-xs">Search:</span>
                            <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} placeholder="Search name..." className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 text-xs">Type:</span>
                            <Select value={typeFilter} onValueChange={(v)=>{ setTypeFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value="all" className="text-white hover:bg-white/20">All</SelectItem>
                                    <SelectItem value="general" className="text-white hover:bg-white/20">General</SelectItem>
                                    <SelectItem value="specific" className="text-white hover:bg-white/20">Specific</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 text-xs">Status:</span>
                            <Select value={statusFilter} onValueChange={(v)=>{ setStatusFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value="all" className="text-white hover:bg-white/20">All</SelectItem>
                                    <SelectItem value="active" className="text-white hover:bg-white/20">Active</SelectItem>
                                    <SelectItem value="inactive" className="text-white hover:bg-white/20">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 text-xs">Ordering:</span>
                            <Select value={ordering} onValueChange={(v)=>{ setOrdering(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-52 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="Ordering" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value='-start_date' className="text-white hover:bg-white/20">Start Date (Newest)</SelectItem>
                                    <SelectItem value='start_date' className="text-white hover:bg-white/20">Start Date (Oldest)</SelectItem>
                                    <SelectItem value='-end_date' className="text-white hover:bg-white/20">End Date (Newest)</SelectItem>
                                    <SelectItem value='end_date' className="text-white hover:bg-white/20">End Date (Oldest)</SelectItem>
                                    <SelectItem value='name' className="text-white hover:bg-white/20">Name A-Z</SelectItem>
                                    <SelectItem value='-name' className="text-white hover:bg-white/20">Name Z-A</SelectItem>
                                    <SelectItem value='-positions_count' className="text-white hover:bg-white/20">Most Positions</SelectItem>
                                    <SelectItem value='positions_count' className="text-white hover:bg-white/20">Fewest Positions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="sm:ml-auto text-white/70 text-sm flex flex-col items-start sm:items-end gap-1">
                        <span>{total} elections found</span>
                        <div className="flex items-center gap-2 text-xs">
                            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1); }}>
                                <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white/70 focus:border-white/40 focus:ring-white/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white/80">
                                    {[15,30,60].map(s => (
                                        <SelectItem key={s} value={String(s)} className="text-white hover:bg-white/20">{s}/page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-1">
                                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Prev</button>
                                <span className="px-1">{page}/{totalPages}</span>
                                <button disabled={page===totalPages || !electionsData?.next} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                        {isFetching && !isLoading && <span className="text-[10px] text-white/40">Updating...</span>}
                    </div>
                </div>
            </div>

            {/* Elections Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/10 text-white/70">
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Type</th>
                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Start</th>
                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">End</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Positions</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {isLoading && Array.from({ length: 6 }).map((_,i)=>(
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-3" colSpan={7}>
                                        <div className="h-4 w-2/3 rounded bg-white/10" />
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && elections.length===0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-white/40">No elections found.</td>
                                </tr>
                            )}
                            {!isLoading && elections.map(election => {
                                const now = new Date();
                                const start = new Date(election.start_date);
                                const end = new Date(election.end_date);
                                const ongoing = start <= now && now <= end;
                                return (
                                    <tr key={election.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 rounded-md bg-gradient-to-r from-green-500 to-blue-600">
                                                    <Trophy className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white leading-tight">{election.name}</div>
                                                    <div className="text-[11px] text-white/40">ID: {election.id.slice(0,8)}…</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-white/80 align-top capitalize">{election.type || 'general'}</td>
                                        <td className="px-4 py-3 text-white/70 align-top whitespace-nowrap">{format(new Date(election.start_date), 'MMM dd, HH:mm')}</td>
                                        <td className="px-4 py-3 text-white/70 align-top whitespace-nowrap">{format(new Date(election.end_date), 'MMM dd, HH:mm')}</td>
                                        <td className="px-4 py-3 text-center text-white font-semibold align-top">{election.positions?.length || 0}</td>
                                        <td className="px-4 py-3 text-center align-top">
                                            {election.is_active ? (
                                                ongoing ? <span className="px-2 py-1 rounded-full text-[11px] font-medium border bg-green-500/15 text-green-400 border-green-400/30">Live</span>
                                                : (new Date() < start ? <span className="px-2 py-1 rounded-full text-[11px] font-medium border bg-amber-500/15 text-amber-400 border-amber-400/30">Scheduled</span>
                                                : <span className="px-2 py-1 rounded-full text-[11px] font-medium border bg-purple-500/15 text-purple-400 border-purple-400/30">Concluded</span>)
                                            ) : <span className="px-2 py-1 rounded-full text-[11px] font-medium border bg-gray-500/15 text-gray-400 border-gray-400/30">Inactive</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center align-top">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleViewElection(election)}
                                                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditElection(election)}
                                                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={()=> toggleElectionMutation.mutate(election.id, {
                                                        onSuccess: () => {
                                                            toast.success(`Election ${election.is_active ? 'paused' : 'activated'} successfully`);
                                                            queryClient.invalidateQueries({ queryKey: ['elections']});
                                                        },
                                                        onError: (error) => {
                                                            toast.error(`Failed to toggle election status: ${error.message}`);
                                                        }
                                                    })}
                                                    disabled={toggleElectionMutation.isPending}
                                                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50"
                                                    title={election.is_active ? 'Pause' : 'Activate'}
                                                >
                                                    {election.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {isFetching && !isLoading && (
                    <div className="px-4 py-2 text-[11px] text-white/40 border-t border-white/10">Updating…</div>
                )}
            </div>

            {/* Create Election Modal */}
            {showCreateModal && (
                <CreateElectionModal 
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={(data) => createElectionMutation.mutate(data, {
                        onSuccess: () => {
                            toast.success('Election created successfully');
                            queryClient.invalidateQueries({ queryKey: ['elections'] });
                            setShowCreateModal(false);
                        },
                        onError: (error) => {
                            toast.error(`Failed to create election: ${error.message}`);
                        }
                    })}
                    isLoading={createElectionMutation.isPending}
                />
            )}

            {/* Edit Election Modal */}
            {showEditModal && editingElection && (
                <EditElectionModal 
                    election={editingElection}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingElection(null);
                    }}
                    onSubmit={(data) => updateElectionMutation.mutate({ 
                        electionId: editingElection.id, 
                        data 
                    }, {
                        onSuccess: () => {
                            toast.success('Election updated successfully');
                            queryClient.invalidateQueries({ queryKey: ['elections'] });
                            setShowEditModal(false);
                            setEditingElection(null);
                        },
                        onError: (error) => {
                            toast.error(`Failed to update election: ${error.message}`);
                        }
                    })}
                    isLoading={updateElectionMutation.isPending}
                />
            )}

            {/* View Election Modal */}
            {showViewModal && viewingElection && (
                <ViewElectionModal 
                    election={viewingElection}
                    onClose={() => {
                        setShowViewModal(false);
                        setViewingElection(null);
                    }}
                />
            )}
        </div>
    );
}

// Card layout removed; table now used

function CreateElectionModal({ 
    onClose, 
    onSubmit, 
    isLoading 
}: { 
    onClose: () => void; 
    onSubmit: (data: ElectionFormData) => void;
    isLoading: boolean;
}) {
    const form = useForm<ElectionFormData>({
        defaultValues: {
            name: '',
            start_date: '',
            end_date: '',
            type: 'general'
        }
    });

    const handleSubmit = (data: ElectionFormData) => {
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Election</h3>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Election name is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Election Name</FormLabel>
                                    <FormControl>
                                        <input
                                            {...field}
                                            placeholder="e.g., Class of 2024 Awards"
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-1 gap-3">
                            <FormField
                                control={form.control}
                                name="start_date"
                                rules={{ required: "Start date is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">Start Date</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="end_date"
                                rules={{ required: "End date is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">End Date</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Election Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                                <SelectItem value="general" className="text-white hover:bg-white/20">General</SelectItem>
                                                <SelectItem value="specific" className="text-white hover:bg-white/20">Specific (e.g Final Year Only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

function EditElectionModal({ 
    election,
    onClose, 
    onSubmit, 
    isLoading 
}: { 
    election: Election;
    onClose: () => void; 
    onSubmit: (data: Partial<ElectionFormData>) => void;
    isLoading: boolean;
}) {
    const form = useForm<ElectionFormData>({
        defaultValues: {
            name: election.name,
            start_date: new Date(election.start_date).toISOString().slice(0, 16),
            end_date: new Date(election.end_date).toISOString().slice(0, 16)
        }
    });

    const handleSubmit = (data: ElectionFormData) => {
        // Only send changed fields
        const changes: Partial<ElectionFormData> = {};
        
        if (data.name !== election.name) {
            changes.name = data.name;
        }
        
        const originalStartDate = new Date(election.start_date).toISOString().slice(0, 16);
        if (data.start_date !== originalStartDate) {
            changes.start_date = data.start_date;
        }
        
        const originalEndDate = new Date(election.end_date).toISOString().slice(0, 16);
        if (data.end_date !== originalEndDate) {
            changes.end_date = data.end_date;
        }

        if (Object.keys(changes).length === 0) {
            toast.info('No changes detected');
            onClose();
            return;
        }

        onSubmit(changes);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Edit Election</h3>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Election name is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Election Name</FormLabel>
                                    <FormControl>
                                        <input
                                            {...field}
                                            placeholder="e.g., Class of 2024 Awards"
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-1 gap-3">
                            <FormField
                                control={form.control}
                                name="start_date"
                                rules={{ required: "Start date is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">Start Date</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="end_date"
                                rules={{ required: "End date is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">End Date</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Warning for active elections */}
                        {election.is_active && (
                            <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-400/30">
                                <div className="flex items-center gap-2 text-amber-400 text-sm">
                                    <span>⚠️</span>
                                    <span>This election is currently active. Changes may affect ongoing voting.</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Election'}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

function ViewElectionModal({ 
    election,
    onClose
}: { 
    election: Election;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState('overview');
    
    const { data: electionDetails } = useQuery({
        queryKey: ['election-details', election.id],
        queryFn: () => getElection(election.id)
    });

    const { data: votingLogs } = useQuery({
        queryKey: ['voting-logs', election.id],
        queryFn: () => getVotingLogs({ election: election.id, page_size: 10 })
    });

    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const isOngoing = startDate <= now && now <= endDate;
    const hasEnded = now > endDate;
    const isUpcoming = now < startDate;

    const tabs = [
        { id: 'overview', name: 'Overview', icon: Trophy },
        { id: 'positions', name: 'Positions', icon: Vote },
        { id: 'statistics', name: 'Statistics', icon: BarChart3 },
        { id: 'activity', name: 'Recent Activity', icon: Users },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            election.is_active 
                                ? "bg-gradient-to-r from-green-500 to-green-600" 
                                : "bg-gradient-to-r from-gray-500 to-gray-600"
                        )}>
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{election.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {election.is_active && isOngoing && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                        🔴 Live
                                    </span>
                                )}
                                {election.is_active && isUpcoming && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                        ⏳ Scheduled
                                    </span>
                                )}
                                {hasEnded && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-400/30">
                                        ✅ Concluded
                                    </span>
                                )}
                                {!election.is_active && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-400/30">
                                        ⏸️ Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/20">
                    <div className="flex overflow-x-auto p-2 scrollbar-hide">
                        <div className="flex gap-1 min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                                        activeTab === tab.id
                                            ? "bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30"
                                            : "text-white/70 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'overview' && (
                        <OverviewTab election={election} electionDetails={electionDetails?.data} />
                    )}
                    {activeTab === 'positions' && (
                        <PositionsTab election={election} positions={electionDetails?.data?.positions || []} />
                    )}
                    {activeTab === 'statistics' && (
                        <StatisticsTab election={election} />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityTab election={election} votingLogs={votingLogs?.data || []} />
                    )}
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ election, electionDetails }: { election: Election; electionDetails: any }) {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <div className="text-2xl font-bold text-blue-400">{electionDetails?.positions?.length || 0}</div>
                    <div className="text-sm text-white/70">Positions</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <div className="text-2xl font-bold text-green-400">0</div>
                    <div className="text-sm text-white/70">Total Votes</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-white/70">Participants</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <div className="text-2xl font-bold text-amber-400">{duration}</div>
                    <div className="text-sm text-white/70">Duration (days)</div>
                </div>
            </div>

            {/* Election Timeline */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Election Timeline</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                            <div className="font-medium text-white">Start Date</div>
                            <div className="text-sm text-white/70">
                                {format(startDate, 'EEEE, MMMM dd, yyyy \'at\' h:mm a')}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Calendar className="h-5 w-5 text-red-400" />
                        <div>
                            <div className="font-medium text-white">End Date</div>
                            <div className="text-sm text-white/70">
                                {format(endDate, 'EEEE, MMMM dd, yyyy \'at\' h:mm a')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                        <div className="font-medium text-white mb-2">Current Status</div>
                        <div className="text-sm text-white/70">
                            {election.is_active ? (
                                now < startDate ? 'Scheduled and Active' :
                                now > endDate ? 'Concluded' : 'Live and Running'
                            ) : 'Inactive'}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                        <div className="font-medium text-white mb-2">Time Remaining</div>
                        <div className="text-sm text-white/70">
                            {now > endDate ? 'Election Ended' :
                             now < startDate ? `Starts in ${Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days` :
                             `Ends in ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PositionsTab({ election, positions }: { election: Election; positions: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Election Positions</h4>
                <span className="text-sm text-white/70">{positions.length} positions</span>
            </div>
            
            {positions.length === 0 ? (
                <div className="text-center py-8">
                    <Vote className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <div className="text-white/70">No positions created yet</div>
                    <div className="text-sm text-white/50">Add positions to start accepting candidates</div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {positions.map((position) => (
                        <div key={position.id} className="p-4 rounded-xl bg-white/5 border border-white/20">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h5 className="font-medium text-white">{position.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-xs",
                                            position.gender_restriction === 'any'
                                                ? "bg-green-500/20 text-green-400"
                                                : position.gender_restriction === 'male'
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-pink-500/20 text-pink-400"
                                        )}>
                                            {position.gender_restriction === 'any' ? 'All Genders' :
                                             position.gender_restriction === 'male' ? 'Male Only' : 'Female Only'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white/70">Candidates</div>
                                    <div className="text-lg font-semibold text-white">{position.candidate_count || 0}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                <div>
                                    <div className="text-white font-medium">{position.vote_count || 0}</div>
                                    <div className="text-white/60">Votes</div>
                                </div>
                                <div>
                                    <div className="text-white font-medium">{position.candidate_count || 0}</div>
                                    <div className="text-white/60">Candidates</div>
                                </div>
                                <div>
                                    <div className="text-white font-medium">0%</div>
                                    <div className="text-white/60">Participation</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatisticsTab({ election }: { election: Election }) {
    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Voting Statistics</h4>
            
            {/* Participation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-sm text-white/70">Total Votes Cast</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-green-400">0</div>
                    <div className="text-sm text-white/70">Unique Voters</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-purple-400">0%</div>
                    <div className="text-sm text-white/70">Participation Rate</div>
                </div>
            </div>

            {/* Voting Trends */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                <h5 className="font-medium text-white mb-4">Voting Trends</h5>
                <div className="h-32 flex items-center justify-center text-white/50">
                    <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">No voting data available yet</div>
                    </div>
                </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <h5 className="font-medium text-white mb-3">Voter Demographics</h5>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/70">Male</span>
                            <span className="text-white">0 (0%)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/70">Female</span>
                            <span className="text-white">0 (0%)</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/20">
                    <h5 className="font-medium text-white mb-3">Peak Voting Hours</h5>
                    <div className="text-center text-white/50">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">No data available</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ election, votingLogs }: { election: Election; votingLogs: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Recent Voting Activity</h4>
                <span className="text-sm text-white/70">Last 10 votes</span>
            </div>
            
            {votingLogs.length === 0 ? (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <div className="text-white/70">No voting activity yet</div>
                    <div className="text-sm text-white/50">Votes will appear here once the election starts</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {votingLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-white">{log.voter_name}</div>
                                    <div className="text-sm text-white/70">
                                        voted for <span className="text-blue-400">{log.candidate_name}</span> in <span className="text-purple-400">{log.position}</span>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-white/60">
                                    {format(new Date(log.voted_at), 'MMM dd, HH:mm')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
