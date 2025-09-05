'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getElection, getElections, getVotingLogs } from '@/services/server/api';
import { Calendar, Plus, Eye, Edit, Trash2, Play, Pause, Trophy, Users, Vote, BarChart3, X, Clock } from 'lucide-react';
import { Election } from '@/@types/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { QUERY_KEYS, useCreateElection, useToggleElectionStatus, useUpdateElection } from '@/services/client/api';

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

    const { data: electionsData, isLoading } = useQuery({
        queryKey: ['elections'],
        queryFn: () => getElections()
    });

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

            {/* Elections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))
                ) : electionsData?.data?.map((election) => (
                    <ElectionCard 
                        key={election.id} 
                        election={election} 
                        onToggleStatus={(id) => toggleElectionMutation.mutate(id, {
                            onSuccess: () => {
                                toast.success(`Election ${election.is_active ? 'paused' : 'activated'} successfully`);
                                queryClient.invalidateQueries({ queryKey: ['elections']});
                            },
                            onError: (error) => {
                                toast.error(`Failed to toggle election status: ${error.message}`);
                            }
                        })}
                        onEditElection={() => handleEditElection(election)}
                        onViewElection={() => handleViewElection(election)}
                        isToggling={toggleElectionMutation.isPending}
                    />
                ))}
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

function ElectionCard({ 
    election, 
    onToggleStatus, 
    onEditElection,
    onViewElection,
    isToggling 
}: { 
    election: Election; 
    onToggleStatus: (id: string) => void;
    onEditElection: () => void;
    onViewElection: () => void;
    isToggling: boolean;
}) {
    const isActive = election.is_active;
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const isOngoing = startDate <= now && now <= endDate;

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/10 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isActive 
                            ? "bg-gradient-to-r from-green-500 to-green-600" 
                            : "bg-gradient-to-r from-gray-500 to-gray-600"
                    )}>
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">{election.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {isActive && isOngoing && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30 whitespace-nowrap">
                                    Live
                                </span>
                            )}
                            {isActive && !isOngoing && now < startDate && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-400/30 whitespace-nowrap">
                                    Scheduled
                                </span>
                            )}
                            {!isActive && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-400/30 whitespace-nowrap">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={onViewElection}
                        className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={onEditElection}
                        className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                        {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-white">{election.positions?.length || 0}</div>
                        <div className="text-xs text-white/60">Positions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-white">0</div>
                        <div className="text-xs text-white/60">Total Votes</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={onViewElection}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all text-sm"
                >
                    View Details
                </button>
                <button 
                    onClick={() => onToggleStatus(election.id)}
                    disabled={isToggling}
                    className={cn(
                        "px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50",
                        isActive
                            ? "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
                    )}
                >
                    {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

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
                                        <select
                                            {...field}
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                        >
                                            <option value="general">General</option>
                                            <option value="specific">Specific (e.g Final Year Only)</option>
                                        </select>
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
