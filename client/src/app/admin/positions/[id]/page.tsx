'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePositionAnalytics, usePosition } from '@/services/client/api';
import { ArrowLeft, Users, Vote, TrendingUp, Award, Clock, User, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5A2B'];

export default function PositionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const positionId = params.id as string;

    const { data: positionData, isLoading: positionLoading } = usePosition(positionId);
    const { data: analyticsData, isLoading: analyticsLoading } = usePositionAnalytics(positionId);

    if (positionLoading || analyticsLoading) {
        return (
            <div className="space-y-6">
                <div className="h-16 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/20 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!positionData?.data || !analyticsData?.data) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">Error loading position data</div>
                <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const position = positionData.data;
    const analytics = analyticsData.data;

    // Transform data for charts
    const voteBreakdownData = analytics.vote_breakdown.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
    }));

    const timelineData = analytics.vote_timeline.map(item => ({
        hour: `${item.hour}:00`,
        votes: item.count
    }));

    const voterDemographicsData = analytics.voter_demographics.map((item, index) => ({
        gender: item.voter__gender,
        count: item.count,
        color: COLORS[index % COLORS.length]
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{position.name}</h1>
                    <p className="text-white/60 mt-1 text-sm sm:text-base break-words">Position Analytics - {position.election_name}</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                            <Vote className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Total Votes</p>
                            <p className="text-2xl font-bold text-white">{analytics.total_votes}</p>
                        </div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Eligible Voters</p>
                            <p className="text-2xl font-bold text-white">{analytics.eligible_voters}</p>
                        </div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Participation Rate</p>
                            <p className="text-2xl font-bold text-white">{analytics.participation_rate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Leading Candidate</p>
                            <p className="text-lg font-bold text-white truncate">
                                {voteBreakdownData[0]?.student_voted_for__full_name || 'No votes yet'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Voted Students */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Voted Students
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {voteBreakdownData.slice(0, 6).map((candidate, index) => (
                        <div key={candidate.student_voted_for__full_name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                    index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                                    index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                                    index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                                    "bg-gradient-to-r from-blue-500 to-purple-600"
                                )}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{candidate.student_voted_for__full_name}</div>
                                    <div className="text-sm text-white/60 capitalize">{candidate.student_voted_for__gender}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">{candidate.vote_count}</div>
                                    <div className="text-xs text-white/60">votes</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vote Distribution Chart */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Vote Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={voteBreakdownData.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="student_voted_for__full_name" 
                                stroke="rgba(255,255,255,0.7)"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }} 
                            />
                            <Bar dataKey="vote_count" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Voting Timeline */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Voting Timeline
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="votes" 
                                stroke="#10B981" 
                                fillOpacity={1} 
                                fill="url(#timelineGradient)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Vote Share Pie Chart */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Vote Share Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={voteBreakdownData.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="vote_count"
                                nameKey="student_voted_for__full_name"
                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                labelLine={false}
                            >
                                {voteBreakdownData.slice(0, 6).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Voter Demographics */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Voter Demographics
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={voterDemographicsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="gender" stroke="rgba(255,255,255,0.7)" />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0,0,0,0.8)', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }} 
                            />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Rankings Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                    <h3 className="text-lg font-semibold text-white">Complete Rankings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="text-left p-4 font-medium text-white/70">Rank</th>
                                <th className="text-left p-4 font-medium text-white/70">Candidate</th>
                                <th className="text-left p-4 font-medium text-white/70">Gender</th>
                                <th className="text-center p-4 font-medium text-white/70">Votes</th>
                                <th className="text-center p-4 font-medium text-white/70">Percentage</th>
                                <th className="text-left p-4 font-medium text-white/70">Vote Bar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {voteBreakdownData.map((candidate, index) => {
                                const percentage = analytics.total_votes > 0 ? (candidate.vote_count / analytics.total_votes) * 100 : 0;
                                return (
                                    <tr key={candidate.student_voted_for__full_name} className="border-b border-white/10 hover:bg-white/5 transition-all">
                                        <td className="p-4">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                                index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                                                index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                                                index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                                                "bg-gradient-to-r from-blue-500 to-purple-600"
                                            )}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{candidate.student_voted_for__full_name}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="capitalize text-white/70">{candidate.student_voted_for__gender}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-lg font-bold text-white">{candidate.vote_count}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-white">{percentage.toFixed(1)}%</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
