'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPositions, getElections, bulkCreatePositions } from '@/services/server/api';
import { Plus, Users, Vote as VoteIcon, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Position, Election } from '@/@types/db';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulkPositionFormData {
    election_id: string;
    positions: string;
}

export default function PositionsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedElection, setSelectedElection] = useState<string>('');
    const queryClient = useQueryClient();

    const { data: positionsData, isLoading: positionsLoading } = useQuery({
        queryKey: ['positions'],
        queryFn: () => getPositions()
    });

    const { data: electionsData } = useQuery({
        queryKey: ['elections'],
        queryFn: () => getElections()
    });

    const createPositionsMutation = useMutation({
        mutationFn: async (data: BulkPositionFormData) => {
            const positions = data.positions.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    const [name, genderRestriction] = line.split('|');
                    return {
                        name: name.trim(),
                        gender_restriction: genderRestriction?.trim() || 'any'
                    };
                });

            return bulkCreatePositions({
                election_id: data.election_id,
                positions: positions as any
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            setShowCreateModal(false);
            toast.success('Positions created successfully');
        },
        onError: () => {
            toast.error('Failed to create positions');
        }
    });

    const filteredPositions = positionsData?.results?.filter(position => {
        if (!selectedElection || selectedElection === 'any') return true;
        return position.election === selectedElection;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Positions Management</h1>
                    <p className="text-white/60 mt-1 text-sm sm:text-base">Manage election positions and voting categories</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span className="whitespace-nowrap">Add Positions</span>
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-white/70" />
                        <span className="text-white/70 text-sm">Filter by Election:</span>
                    </div>
                    <Select value={selectedElection} onValueChange={setSelectedElection}>
                        <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                            <SelectValue placeholder="All Elections" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                            <SelectItem value='any' className="text-white hover:bg-white/20">
                                All Elections
                            </SelectItem>
                            {electionsData?.data?.map((election) => (
                                <SelectItem key={election.id} value={election.id} className="text-white hover:bg-white/20">
                                    {election.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="sm:ml-auto text-white/70 text-sm text-center sm:text-left">
                        {filteredPositions?.length || 0} positions found
                    </div>
                </div>
            </div>

            {/* Positions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {positionsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))
                ) : filteredPositions?.map((position) => (
                    <PositionCard key={position.id} position={position} />
                ))}
            </div>

            {/* Create Positions Modal */}
            {showCreateModal && (
                <CreatePositionsModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={(data) => createPositionsMutation.mutate(data)}
                    isLoading={createPositionsMutation.isPending}
                    elections={electionsData?.data || []}
                />
            )}
        </div>
    );
}

function PositionCard({ position }: { position: Position }) {
    const router = useRouter();

    const handleViewAnalytics = () => {
        router.push(`/admin/positions/${position.id}`);
    };

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
                        <VoteIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{position.name}</h3>
                        <p className="text-white/60 text-sm">{position.election_name}</p>
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-white">{position.candidate_count || 0}</div>
                        <div className="text-xs text-white/60">Candidates</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-white">{position?.vote_count || 0}</div>
                        <div className="text-xs text-white/60">Votes</div>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        position.gender_restriction === 'any'
                            ? "bg-green-500/20 text-green-400 border border-green-400/30"
                            : position.gender_restriction === 'male'
                            ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                            : "bg-pink-500/20 text-pink-400 border border-pink-400/30"
                    )}>
                        {position.gender_restriction === 'any' ? 'All Genders' : 
                         position.gender_restriction === 'male' ? 'Male Only' : 'Female Only'}
                    </span>
                </div>
            </div>

            <button 
                onClick={handleViewAnalytics}
                className="w-full px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all text-sm"
            >
                View Analytics
            </button>
        </div>
    );
}

function CreatePositionsModal({ 
    onClose, 
    onSubmit, 
    isLoading,
    elections
}: { 
    onClose: () => void; 
    onSubmit: (data: BulkPositionFormData) => void;
    isLoading: boolean;
    elections: Election[];
}) {
    const form = useForm<BulkPositionFormData>({
        defaultValues: {
            election_id: '',
            positions: ''
        }
    });

    const handleSubmit = (data: BulkPositionFormData) => {
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Create Positions</h3>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="election_id"
                            rules={{ required: "Election is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Election</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                                <SelectValue placeholder="Select Election" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                                {elections.map((election) => (
                                                    <SelectItem 
                                                        key={election.id} 
                                                        value={election.id} 
                                                        className="text-white hover:bg-white/20 focus:bg-white/20"
                                                    >
                                                        {election.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="positions"
                            rules={{ required: "At least one position is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Positions</FormLabel>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            rows={8}
                                            placeholder="Enter positions, one per line. You can optionally specify gender restriction like:
                                                Best Dressed|any
                                                Most Handsome|male
                                                Most Beautiful|female"
                                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <div className="text-xs text-white/60 mt-1">
                                        Format: Position Name|gender (optional). Gender options: any, male, female
                                    </div>
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
                                {isLoading ? 'Creating...' : 'Create Positions'}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
