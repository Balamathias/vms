'use client';

import { useState } from 'react';
import { Student } from '@/@types/db';
import { useToggleStudentStatus, useResetStudentPassword } from '@/services/client/api';
import { UserX, UserCheck, RotateCcw, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StudentRowProps {
    student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
    const [showDetails, setShowDetails] = useState(false);
    
    const { mutate: toggleStatus, isPending: isToggling } = useToggleStudentStatus();
    const { mutate: resetPassword, isPending: isResetting } = useResetStudentPassword();

    const handleToggleStatus = () => {
        toggleStatus(student.id, {
            onSuccess: () => {
                toast.success(`Student ${student.is_active ? 'deactivated' : 'activated'} successfully`);
            },
            onError: () => {
                toast.error('Failed to update student status');
            }
        });
    };

    const handleResetPassword = () => {
        if (window.confirm('Are you sure you want to reset this student\'s password to "password123"?')) {
            resetPassword({ studentId: student.id, newPassword: 'password123' }, {
                onSuccess: () => {
                    toast.success('Password reset successfully');
                },
                onError: () => {
                    toast.error('Failed to reset password');
                }
            });
        }
    };

    return (
        <>
            <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-white/10 hover:bg-white/5 transition-all">
                {/* Student Info */}
                <div className="col-span-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {student.full_name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-white">{student.full_name}</div>
                        <div className="text-sm text-white/60 font-mono">{student.matric_number}</div>
                    </div>
                </div>

                {/* Level */}
                <div className="text-center text-white">{student.level} Level</div>

                {/* Status */}
                <div className="text-center">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        student.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-400/30"
                            : "bg-red-500/20 text-red-400 border border-red-400/30"
                    )}>
                        {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleToggleStatus}
                        disabled={isToggling}
                        className={cn(
                            "p-2 rounded-lg border transition-all disabled:opacity-50",
                            student.is_active
                                ? "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                                : "bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
                        )}
                        title={student.is_active ? 'Deactivate' : 'Activate'}
                    >
                        {student.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-50"
                        title="Reset Password"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {showDetails && (
                <div className="col-span-8 bg-white/5 border border-white/10 rounded-lg p-4 mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="text-white font-medium mb-2">Personal Information</h4>
                            <div className="space-y-1 text-sm text-white/70">
                                <div><strong>Email:</strong> {student.email || 'Not provided'}</div>
                                <div><strong>Phone:</strong> {student.phone_number || 'Not provided'}</div>
                                <div><strong>Gender:</strong> {student.gender}</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-2">Academic Information</h4>
                            <div className="space-y-1 text-sm text-white/70">
                                <div><strong>Level:</strong> {student.level}</div>
                                <div><strong>State of Origin:</strong> {student.state_of_origin}</div>
                                <div><strong>Status:</strong> {student.status}</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-2">System Information</h4>
                            <div className="space-y-1 text-sm text-white/70">
                                <div><strong>Date Joined:</strong> {new Date(student.date_joined).toLocaleDateString()}</div>
                                <div><strong>Is Staff:</strong> {student.is_staff ? 'Yes' : 'No'}</div>
                                <div><strong>Account Status:</strong> {student.is_active ? 'Active' : 'Inactive'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
