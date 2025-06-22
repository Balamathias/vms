'use client';

import { useState } from 'react';
import { useBulkImportStudents } from '@/services/client/api';
import { Upload, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImportStudentsModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportStudentsModal({ onClose, onSuccess }: ImportStudentsModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    
    const { mutate: importStudents, isPending, data: importResult } = useBulkImportStudents();

    const handleFileSelect = (file: File) => {
        if (file.type !== 'text/csv') {
            toast.error('Please select a CSV file');
            return;
        }
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleImport = () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        importStudents(selectedFile, {
            onSuccess: (data) => {
                if (data?.data) {
                    toast.success(`Successfully imported ${data.data.created_count} students`);
                    if (data.data.errors.length > 0) {
                        toast.warning(`${data.data.errors.length} errors occurred during import`);
                    }
                    onSuccess();
                }
            },
            onError: () => {
                toast.error('Failed to import students');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Import Students</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {!importResult && (
                    <>
                        {/* CSV Format Instructions */}
                        <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-400/30">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-400" />
                                <span className="font-medium text-blue-400">CSV Format Requirements</span>
                            </div>
                            <div className="text-sm text-white/70">
                                <p className="mb-2">Your CSV file should have the following columns:</p>
                                <code className="block p-2 bg-white/10 rounded text-xs break-all">
                                    matric_number,full_name,level,gender,state_of_origin,email,phone_number
                                </code>
                                <p className="mt-2 text-white/60">
                                    Required fields: matric_number, full_name, level, state_of_origin
                                </p>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                                dragOver 
                                    ? 'border-blue-400 bg-blue-500/10' 
                                    : 'border-white/30 hover:border-white/50'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                        >
                            <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                            {selectedFile ? (
                                <div>
                                    <p className="text-white font-medium mb-2">{selectedFile.name}</p>
                                    <p className="text-white/60 text-sm">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white/70 mb-2">Drop CSV file here or click to browse</p>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg cursor-pointer hover:bg-blue-500/30 transition-all"
                                    >
                                        Select File
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!selectedFile || isPending}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Importing...' : 'Import Students'}
                            </button>
                        </div>
                    </>
                )}

                {/* Import Results */}
                {importResult?.data && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Import Completed</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-500/20 border border-green-400/30">
                                <div className="text-2xl font-bold text-green-400">
                                    {importResult.data.created_count}
                                </div>
                                <div className="text-sm text-white/70">Students Created</div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30">
                                <div className="text-2xl font-bold text-red-400">
                                    {importResult.data.errors.length}
                                </div>
                                <div className="text-sm text-white/70">Errors</div>
                            </div>
                        </div>

                        {importResult.data.errors.length > 0 && (
                            <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="font-medium text-red-400">Import Errors</span>
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {importResult.data.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-white/70 mb-1">
                                            {error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
