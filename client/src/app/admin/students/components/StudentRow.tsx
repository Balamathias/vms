'use client';

import { useState } from 'react';
import { Student } from '@/@types/db';
import { useToggleStudentStatus, useResetStudentPassword } from '@/services/client/api';
import { UserX, UserCheck, RotateCcw, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TableRow, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';


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
            <TableRow>
                {/* Student Info */}
                <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {student.full_name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-medium text-white">{student.full_name}</div>
                            <div className="text-sm text-white/60 font-mono">{student.matric_number}</div>
                        </div>
                    </div>
                </TableCell>

                {/* Level */}
                <TableCell className="text-center text-white">
                    {student.level} Level
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        student.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-400/30"
                            : "bg-red-500/20 text-red-400 border border-red-400/30"
                    )}>
                        {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                </TableCell>

                {/* Actions */}
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                        >
                            <DropdownMenuItem 
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-white hover:bg-white/10"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {showDetails ? 'Hide Details' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={handleToggleStatus}
                                disabled={isToggling}
                                className={cn(
                                    "text-white hover:bg-white/10",
                                    student.is_active ? "text-red-400" : "text-green-400"
                                )}
                            >
                                {student.is_active ? (
                                    <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate Student
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate Student
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={handleResetPassword}
                                disabled={isResetting}
                                className="text-amber-400 hover:bg-white/10"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset Password
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {/* Expanded Details */}
            {showDetails && (
                <TableRow>
                    <TableCell colSpan={4} className="bg-white/5 border border-white/10 p-4">
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
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
