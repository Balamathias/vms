'use client';

import { useAdminDashboard } from '@/services/client/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Vote, Trophy, TrendingUp, Activity, Calendar, Award, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
    const { data: dashboardData, isLoading, error } = useAdminDashboard();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !dashboardData?.data) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">Error loading dashboard data</div>
                <button 
                    onClick={() => router.refresh()}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { overview, recent_activity, current_election } = dashboardData.data;

    const overviewCards = [
        {
            title: 'Total Students',
            value: overview.total_students,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            change: recent_activity.new_students,
            changeLabel: 'new this week'
        },
        {
            title: 'Active Students',
            value: overview.active_students,
            icon: UserCheck,
            color: 'from-green-500 to-green-600',
            change: `${((overview.active_students / overview.total_students) * 100).toFixed(1)}%`,
            changeLabel: 'of total'
        },
        {
            title: 'Total Votes',
            value: overview.total_votes,
            icon: Vote,
            color: 'from-purple-500 to-purple-600',
            change: recent_activity.new_votes,
            changeLabel: 'new this week'
        },
        {
            title: 'Elections',
            value: overview.total_elections,
            icon: Trophy,
            color: 'from-amber-500 to-amber-600',
            change: overview.active_elections,
            changeLabel: 'currently active'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex sm:items-center justify-center sm:justify-between flex-col sm:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-white/60 mt-1">Overview of voting management system</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 justify-center rounded-lg bg-white/10 border border-white/20 text-white/70">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Real-time</span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, index) => (
                    <div
                        key={card.title}
                        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "p-3 rounded-xl bg-gradient-to-r",
                                    card.color
                                )}>
                                    <card.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/60 mb-1">+{card.change}</div>
                                    <div className="text-xs text-white/50">{card.changeLabel}</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{card.value.toLocaleString()}</div>
                            <div className="text-sm text-white/70">{card.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Current Election Status */}
            {current_election && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Current Election</h3>
                            <p className="text-white/60">{current_election.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                                {current_election.positions_count}
                            </div>
                            <div className="text-sm text-white/70">Positions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                                {current_election.total_votes.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70">Total Votes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                                {current_election.eligible_voters.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70">Eligible Voters</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                                {current_election.participation_rate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-white/70">Participation</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-green-500/20 border border-green-400/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-400">
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">Election is currently active and accepting votes</span>
                            </div>
                            <button
                                onClick={() => router.push(`/results/${current_election.id}`)}
                                className="px-4 py-2 text-sm rounded-lg bg-green-500/20 border border-green-400/30 cursor-pointer text-green-400 hover:bg-green-500/30 transition-all"
                            >
                                View Election
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">System Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-400" />
                                <span className="text-white">New Students Registered</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-400">+{recent_activity.new_students}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <Vote className="h-5 w-5 text-purple-400" />
                                <span className="text-white">New Votes Cast</span>
                            </div>
                            <span className="text-2xl font-bold text-purple-400">+{recent_activity.new_votes}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-green-400" />
                                <span className="text-white">New Candidates</span>
                            </div>
                            <span className="text-2xl font-bold text-green-400">+{recent_activity.new_candidates}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/admin/students?import=true')}
                            className="cursor-pointer w-full p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 text-blue-400 hover:from-blue-500/30 hover:to-blue-600/30 transition-all">
                            Import Students
                        </button>
                        <button
                            onClick={() => router.push('/admin/elections?create=true')}
                            className="cursor-pointer w-full p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 text-purple-400 hover:from-purple-500/30 hover:to-purple-600/30 transition-all">
                            Create Election
                        </button>
                        <button
                            onClick={() => router.push('/admin/reports?export=true')}
                                 className="cursor-pointer w-full p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 text-green-400 hover:from-green-500/30 hover:to-green-600/30 transition-all">
                            Export Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
