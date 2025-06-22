'use client';

import { useState } from 'react';
import { useAllStudents, useBulkImportStudents, useExportStudents } from '@/services/client/api';
import { Search, Filter, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import StudentRow from './components/StudentRow';
import ImportStudentsModal from './components/ImportStudentsModal';

export default function StudentsPage() {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        level: '',
        status: '',
        page: 1,
        page_size: 20
    });
    const [showImportModal, setShowImportModal] = useState(false);

    const { data: studentsData, isLoading } = useAllStudents({
        search: search || undefined,
        level: filters.level ? parseInt(filters.level) : undefined,
        status: filters.status || undefined,
        page: filters.page,
        page_size: filters.page_size
    });

    const { mutate: exportStudents, isPending: isExporting } = useExportStudents();

    const handleExport = () => {
        exportStudents(undefined, {
            onSuccess: (blob) => {
                if (blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Students exported successfully');
                } else {
                    toast.error('Failed to export students');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Students Management</h1>
                    <p className="text-white/60 mt-1">Manage student accounts and data</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-400 hover:bg-green-500/30 transition-all"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all"
                    >
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search by name or matric..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filters.level}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-gray-800 text-white">All Levels</option>
                        <option value="100" className="bg-gray-800 text-white">100 Level</option>
                        <option value="200" className="bg-gray-800 text-white">200 Level</option>
                        <option value="300" className="bg-gray-800 text-white">300 Level</option>
                        <option value="400" className="bg-gray-800 text-white">400 Level</option>
                        <option value="500" className="bg-gray-800 text-white">500 Level</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-gray-800 text-white">All Status</option>
                        <option value="active" className="bg-gray-800 text-white">Active</option>
                        <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                        <option value="graduated" className="bg-gray-800 text-white">Graduated</option>
                    </select>
                    <div className="flex items-center gap-2 text-white/70">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">
                            {studentsData?.count || 0} students found
                        </span>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
                <div className="p-4">
                    <div className="grid grid-cols-8 gap-4 text-white/70 font-medium mb-4 text-sm">
                        <div className="col-span-2">Student</div>
                        <div className="text-center">Level</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Actions</div>
                    </div>
                    
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-8 gap-4 items-center py-3 border-b border-white/10">
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                                    <div className="space-y-1">
                                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                                <div className="flex gap-2 justify-center">
                                    <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                    <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                    <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : studentsData?.results?.map((student) => (
                        <StudentRow key={student.id} student={student} />
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {studentsData && (
                <div className="flex items-center justify-between">
                    <div className="text-white/70">
                        Showing {((filters.page - 1) * filters.page_size) + 1} to {Math.min(filters.page * filters.page_size, studentsData.count)} of {studentsData.count} students
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={!studentsData.previous}
                            className="px-3 py-1 rounded bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-white">
                            Page {filters.page}
                        </span>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={!studentsData.next}
                            className="px-3 py-1 rounded bg-white/10 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <ImportStudentsModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        // Refresh data if needed
                    }}
                />
            )}
        </div>
    );
}