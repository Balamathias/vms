'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPositions, getElections, bulkCreatePositions } from '@/services/server/api';
import { Plus, Users, Vote as VoteIcon, Filter, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Position, Election } from '@/@types/db';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulkPositionFormData {
    election_id: string;
    positions: string;
    position_type: 'senior' | 'junior';
}

export default function PositionsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedElection, setSelectedElection] = useState<string>('');
    const [selectedPositionType, setSelectedPositionType] = useState<string>('');
    const [genderRestriction, setGenderRestriction] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [ordering, setOrdering] = useState<string>('name');
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(30);
    const queryClient = useQueryClient();

    const router = useRouter();

    const { data: positionsData, isLoading: positionsLoading, isFetching: positionsFetching } = useQuery<import("@/@types/generics").PaginatedStackResponse<Position[]>>({
        queryKey: ['positions', { selectedElection, selectedPositionType, genderRestriction, search, ordering, page, pageSize }],
        queryFn: () => getPositions({
            election: selectedElection && selectedElection !== 'any' ? selectedElection : undefined,
            position_type: selectedPositionType && selectedPositionType !== 'any' ? (selectedPositionType as 'senior' | 'junior') : undefined,
            gender_restriction: genderRestriction && genderRestriction !== 'any' ? (genderRestriction as 'any' | 'male' | 'female') : undefined,
            q: search || undefined,
            ordering: ordering,
            page,
            page_size: pageSize,
        })
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
                        gender_restriction: genderRestriction?.trim() || 'any',
                        position_type: data.position_type
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

    const positions: Position[] = positionsData?.data ?? [];
    const total: number = positionsData?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(()=>{ if(page>totalPages) setPage(totalPages); },[totalPages,page]);

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
                        <span className="text-white/70 text-sm">Filters:</span>
                    </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <div className="flex flex-col gap-2">
                            <span className="text-white/70 text-xs">Election:</span>
                <Select value={selectedElection} onValueChange={(v)=>{ setSelectedElection(v); setPage(1); }}>
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
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-white/70 text-xs">Position Type:</span>
                            <Select value={selectedPositionType} onValueChange={(v)=>{ setSelectedPositionType(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value='any' className="text-white hover:bg-white/20">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value='senior' className="text-white hover:bg-white/20">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            Senior Awards
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='junior' className="text-white hover:bg-white/20">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                            Junior Awards
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-white/70 text-xs">Gender Restriction:</span>
                            <Select value={genderRestriction} onValueChange={(v)=>{ setGenderRestriction(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value='any' className="text-white hover:bg-white/20">All</SelectItem>
                                    <SelectItem value='male' className="text-white hover:bg-white/20">Male Only</SelectItem>
                                    <SelectItem value='female' className="text-white hover:bg-white/20">Female Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-white/70 text-xs">Ordering:</span>
                            <Select value={ordering} onValueChange={(v)=>{ setOrdering(v); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-44 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                    <SelectItem value='name' className="text-white hover:bg-white/20">Name A-Z</SelectItem>
                                    <SelectItem value='-name' className="text-white hover:bg-white/20">Name Z-A</SelectItem>
                                    <SelectItem value='-created_at' className="text-white hover:bg-white/20">Newest</SelectItem>
                                    <SelectItem value='created_at' className="text-white hover:bg-white/20">Oldest</SelectItem>
                                    <SelectItem value='-candidate_count' className="text-white hover:bg-white/20">Most Candidates</SelectItem>
                                    <SelectItem value='candidate_count' className="text-white hover:bg-white/20">Fewest Candidates</SelectItem>
                                    <SelectItem value='-vote_count' className="text-white hover:bg-white/20">Most Votes</SelectItem>
                                    <SelectItem value='vote_count' className="text-white hover:bg-white/20">Fewest Votes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-white/70 text-xs">Search:</span>
                            <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} placeholder="Search name..." className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="sm:ml-auto text-white/70 text-sm text-center sm:text-left flex flex-col items-start sm:items-end gap-1">
                        <span>{total} positions found</span>
                        <div className="flex items-center gap-2 text-xs">
                            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1); }}>
                                <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white/70 focus:border-white/40 focus:ring-white/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white/80">
                                    {[15,30,60,100].map(s => (
                                        <SelectItem key={s} value={String(s)} className="text-white hover:bg-white/20">{s}/page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-1">
                                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Prev</button>
                                <span className="px-1">{page}/{totalPages}</span>
                                <button disabled={page===totalPages || !positionsData?.next} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                        {positionsFetching && <span className="text-[10px] text-white/40">Updating...</span>}
                    </div>
                </div>
            </div>

            {/* Positions Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/10 text-white/70">
                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Name</th>
                                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Election</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Candidates</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Votes</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Gender</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Type</th>
                                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {positionsLoading && (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3" colSpan={7}>
                                            <div className="h-4 w-2/3 rounded bg-white/10" />
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!positionsLoading && positions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-white/40 text-sm">No positions found matching filters.</td>
                                </tr>
                            )}
                            {!positionsLoading && positions.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 align-top">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-md bg-gradient-to-r from-purple-500 to-blue-600">
                                                <VoteIcon className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white leading-tight">{p.name}</div>
                                                <div className="text-[11px] text-white/40">ID: {p.id.slice(0,8)}…</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-white/80 align-top whitespace-nowrap">{p.election_name}</td>
                                    <td className="px-4 py-3 text-center text-white font-semibold align-top">{p.candidate_count ?? 0}</td>
                                    <td className="px-4 py-3 text-center text-white font-semibold align-top">{p.vote_count ?? 0}</td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[11px] font-medium border inline-block",
                                            p.gender_restriction === 'any' ? 'bg-green-500/15 text-green-400 border-green-400/30' :
                                            p.gender_restriction === 'male' ? 'bg-blue-500/15 text-blue-400 border-blue-400/30' :
                                            'bg-pink-500/15 text-pink-400 border-pink-400/30'
                                        )}>
                                            {p.gender_restriction === 'any' ? 'All' : p.gender_restriction === 'male' ? 'Male' : 'Female'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[11px] font-medium border inline-block",
                                            p.position_type === 'senior' ? 'bg-purple-500/15 text-purple-400 border-purple-400/30' : 'bg-orange-500/15 text-orange-400 border-orange-400/30'
                                        )}>
                                            {p.position_type === 'senior' ? 'Senior' : 'Junior'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => router.push(`/admin/positions/${p.id}`)}
                                                className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                                                title="View Analytics"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                disabled
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                                                title="Edit (coming soon)"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {positionsFetching && !positionsLoading && (
                    <div className="px-4 py-2 text-[11px] text-white/40 border-t border-white/10">Updating…</div>
                )}
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

// PositionCard removed in favor of table layout

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
            positions: '',
            position_type: 'senior'
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
                            name="position_type"
                            rules={{ required: "Position type is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">Position Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                                <SelectValue placeholder="Select Position Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                                                <SelectItem 
                                                    value="senior" 
                                                    className="text-white hover:bg-white/20 focus:bg-white/20"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                        Senior Award (500 Level)
                                                    </div>
                                                </SelectItem>
                                                <SelectItem 
                                                    value="junior" 
                                                    className="text-white hover:bg-white/20 focus:bg-white/20"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                        Junior Award (100-400 Level)
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                    <div className="text-xs text-white/60 mt-1">
                                        Senior awards are for 500 level students, Junior awards for 100-400 level students
                                    </div>
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
