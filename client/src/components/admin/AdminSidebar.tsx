'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Trophy,
    Settings,
    BarChart3,
    FileText,
    UserCheck,
    Menu,
    X,
    Vote,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Elections', href: '/admin/elections', icon: Trophy },
    { name: 'Positions', href: '/admin/positions', icon: Vote },
    { name: 'Votes', href: '/admin/votes', icon: BarChart3 },
    { name: 'Candidates', href: '/admin/candidates', icon: UserCheck },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-[18px] left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white md:hidden hover:bg-white/20 transition-all"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Desktop always visible, Mobile slideable */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-72 bg-white/5 backdrop-blur-xl border-r border-white/20 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                    "md:block", // Always visible on desktop
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">VMS Admin</h2>
                                <p className="text-sm text-white/60">Control Panel</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg text-white/60 hover:text-white md:hidden transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 shadow-lg"
                                            : "text-white/70 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                                    )} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/20">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-amber-400" />
                                <span className="text-sm font-medium text-amber-400">Admin Access</span>
                            </div>
                            <p className="text-xs text-white/60">
                                You have administrative privileges for this system.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
