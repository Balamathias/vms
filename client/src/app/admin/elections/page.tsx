'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getElections } from '@/services/server/api';
import { Calendar, Plus, Eye, Edit, Trash2, Play, Pause, Trophy, Users, Vote } from 'lucide-react';
import { Election } from '@/@types/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { getCookie } from 'cookies-next/client'
import { API_URL } from '@/services/utils';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { QUERY_KEYS, useCreateElection, useToggleElectionStatus } from '@/services/client/api';

export interface ElectionFormData {
    name: string;
    start_date: string;
    end_date: string;
}

export default function ElectionsPage() {

    const searchParams = useSearchParams()
    const [showCreateModal, setShowCreateModal] = useState(Boolean(searchParams.get('create')) || false);
    const queryClient = useQueryClient();

    const { data: electionsData, isLoading } = useQuery({
        queryKey: ['elections'],
        queryFn: () => getElections()
    });

    const createElectionMutation = useCreateElection();

    const toggleElectionMutation = useToggleElectionStatus()

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
        </div>
    );
}

function ElectionCard({ 
    election, 
    onToggleStatus, 
    isToggling 
}: { 
    election: Election; 
    onToggleStatus: (id: string) => void;
    isToggling: boolean;
}) {
    const isActive = election.is_active;
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const isOngoing = startDate <= now && now <= endDate;

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        isActive 
                            ? "bg-gradient-to-r from-green-500 to-green-600" 
                            : "bg-gradient-to-r from-gray-500 to-gray-600"
                    )}>
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{election.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {isActive && isOngoing && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                    Live
                                </span>
                            )}
                            {isActive && !isOngoing && now < startDate && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                    Scheduled
                                </span>
                            )}
                            {!isActive && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-400/30">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all">
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all">
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
                <button className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all text-sm">
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
            end_date: ''
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
