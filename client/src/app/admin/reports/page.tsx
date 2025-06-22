'use client';

import { useState } from 'react';
import { useStudentAnalytics, useAdminDashboard, useExportStudents, useExportVotes } from '@/services/client/api';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Users, Vote, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState('overview');

    const { data: dashboardData } = useAdminDashboard();
    const { data: studentAnalytics } = useStudentAnalytics();
    const { mutate: exportStudents, isPending: isExportingStudents } = useExportStudents();
    const { mutate: exportVotes, isPending: isExportingVotes } = useExportVotes();

    const handleExportStudents = () => {
        exportStudents(undefined, {
            onSuccess: (blob) => {
                if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `students_report_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Students report exported successfully');
                }
            }
        });
    };

    const handleExportVotes = () => {
        exportVotes(undefined, {
            onSuccess: (blob) => {
                if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `votes_report_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Votes report exported successfully');
                }
            }
        });
    };

    const reportTabs = [
        { id: 'overview', name: 'System Overview', icon: BarChart3 },
        { id: 'students', name: 'Student Analytics', icon: Users },
        { id: 'voting', name: 'Voting Analytics', icon: Vote },
        { id: 'exports', name: 'Data Exports', icon: Download },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                    <p className="text-white/60 mt-1">Comprehensive system insights and data exports</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Last updated: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* Report Tabs */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-2">
                <div className="flex space-x-1">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedReport === tab.id
                                    ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
                {selectedReport === 'overview' && (
                    <OverviewReport dashboardData={dashboardData?.data} />
                )}
                {selectedReport === 'students' && (
                    <StudentReport studentAnalytics={studentAnalytics?.data} />
                )}
                {selectedReport === 'voting' && (
                    <VotingReport dashboardData={dashboardData?.data} />
                )}
                {selectedReport === 'exports' && (
                    <ExportsReport 
                        onExportStudents={handleExportStudents}
                        onExportVotes={handleExportVotes}
                        isExportingStudents={isExportingStudents}
                        isExportingVotes={isExportingVotes}
                    />
                )}
            </div>
        </div>
    );
}

function OverviewReport({ dashboardData }: { dashboardData: any }) {
    if (!dashboardData) return <div>Loading...</div>;

    const overviewData = [
        { name: 'Students', value: dashboardData.overview.total_students, color: '#3B82F6' },
        { name: 'Elections', value: dashboardData.overview.total_elections, color: '#8B5CF6' },
        { name: 'Votes', value: dashboardData.overview.total_votes, color: '#10B981' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overviewData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white'
                            }} 
                        />
                        <Bar dataKey="value" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-blue-400" />
                            <span className="text-white">New Students</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-400">
                            +{dashboardData.recent_activity.new_students}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <Vote className="h-5 w-5 text-green-400" />
                            <span className="text-white">New Votes</span>
                        </div>
                        <span className="text-2xl font-bold text-green-400">
                            +{dashboardData.recent_activity.new_votes}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                            <span className="text-white">New Candidates</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-400">
                            +{dashboardData.recent_activity.new_candidates}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentReport({ studentAnalytics }: { studentAnalytics: any }) {
    if (!studentAnalytics) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Students by Level</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentAnalytics.distributions.by_level}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="level" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white'
                            }} 
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie
                            data={studentAnalytics.distributions.by_gender}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            nameKey="gender"
                        >
                            {studentAnalytics.distributions.by_gender.map((entry: any, index: number) => (
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
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function VotingReport({ dashboardData }: { dashboardData: any }) {
    if (!dashboardData?.current_election) {
        return (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6 text-center">
                <Vote className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Election</h3>
                <p className="text-white/60">Start an election to view voting analytics</p>
            </div>
        );
    }

    const election = dashboardData.current_election;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Election: {election.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{election.positions_count}</div>
                        <div className="text-white/70">Positions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{election.total_votes}</div>
                        <div className="text-white/70">Total Votes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{election.eligible_voters}</div>
                        <div className="text-white/70">Eligible Voters</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">{election.participation_rate}%</div>
                        <div className="text-white/70">Participation</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExportsReport({ 
    onExportStudents, 
    onExportVotes, 
    isExportingStudents, 
    isExportingVotes 
}: {
    onExportStudents: () => void;
    onExportVotes: () => void;
    isExportingStudents: boolean;
    isExportingVotes: boolean;
}) {
    const exportOptions = [
        {
            title: 'Students Database',
            description: 'Export complete student records including personal and academic information',
            icon: Users,
            action: onExportStudents,
            loading: isExportingStudents,
            color: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Voting Records',
            description: 'Export all voting activity and election results data',
            icon: Vote,
            action: onExportVotes,
            loading: isExportingVotes,
            color: 'from-green-500 to-green-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exportOptions.map((option, index) => (
                <div key={index} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color}`}>
                            <option.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                            <p className="text-white/60 text-sm mb-4">{option.description}</p>
                            <button
                                onClick={option.action}
                                disabled={option.loading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${option.color} text-white hover:opacity-90 transition-all disabled:opacity-50`}
                            >
                                <Download className="h-4 w-4" />
                                {option.loading ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
