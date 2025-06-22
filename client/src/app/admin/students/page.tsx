'use client';

import { useState } from 'react';
import { useAllStudents, useBulkImportStudents, useExportStudents } from '@/services/client/api';
import { Search, Filter, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import StudentRow from './components/StudentRow';
import ImportStudentsModal from './components/ImportStudentsModal';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Students Management</h1>
                    <p className="text-white/60 mt-1">Manage student accounts and data</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-400 hover:bg-green-500/30 transition-all"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all"
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
                    <Select
                        value={filters.level}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, level: value, page: 1 }))}
                    >
                        <SelectTrigger className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent className='bg-white/10 backdrop-blur-md border border-white/25 shadow-xl'>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="100">100 Level</SelectItem>
                            <SelectItem value="200">200 Level</SelectItem>
                            <SelectItem value="300">300 Level</SelectItem>
                            <SelectItem value="400">400 Level</SelectItem>
                            <SelectItem value="500">500 Level</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                    >
                        <SelectTrigger className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className='bg-white/10 backdrop-blur-md border border-white/25 shadow-xl'>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="graduated">Graduated</SelectItem>
                        </SelectContent>
                    </Select>
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="col-span-2 text-white/70">Student</TableHead>
                            <TableHead className="text-center text-white/70">Level</TableHead>
                            <TableHead className="text-center text-white/70">Status</TableHead>
                            <TableHead className="text-center text-white/70">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="col-span-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                                            <div className="space-y-1">
                                                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                                                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="h-4 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="h-4 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex gap-2 justify-center">
                                            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : studentsData?.results?.map((student) => (
                            <StudentRow key={student.id} student={student} />
                        ))}
                    </TableBody>
                </Table>
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