'use client';

import { Bell, Search, LogOut } from 'lucide-react';
import { Student } from '@/@types/db';
import { useLogout } from '@/services/client/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AdminHeaderProps {
    user: Student;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const { mutate: logout, isPending } = useLogout();
    const router = useRouter();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                router.push('/login');
            },
            onError: (error) => {
                toast.error('Logout failed');
            }
        });
    };

    return (
        <header className="sticky top-0 z-30 border-b border-white/20 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search students, elections, positions..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User menu */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user.full_name}</p>
                            <p className="text-xs text-white/60">Administrator</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.full_name.charAt(0)}
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isPending}
                            className="p-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
