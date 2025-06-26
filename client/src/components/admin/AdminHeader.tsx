'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, LogOut, Users, Trophy, Vote } from 'lucide-react';
import { Student } from '@/@types/db';
import { useLogout } from '@/services/client/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useGlobalSearch } from '@/services/client/api';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
    user: Student;
}

interface SearchResult {
    type: 'student' | 'election' | 'position';
    id: string;
    title: string;
    subtitle: string;
    href: string;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const { mutate: logout, isPending } = useLogout();
    const router = useRouter();

    const { data: globalSearchData, isLoading: isSearching } = useGlobalSearch(searchQuery);

    useEffect(() => {
        if (globalSearchData?.data) {
            const results: SearchResult[] = [];
            
            // Add students to results
            globalSearchData.data.students?.forEach(student => {
                results.push({
                    type: 'student',
                    id: student.id,
                    title: student.full_name,
                    subtitle: `${student.matric_number} • ${student.level} Level`,
                    href: `/admin/students?search=${student.matric_number}`
                });
            });

            // Add elections to results
            globalSearchData.data.elections?.forEach(election => {
                results.push({
                    type: 'election',
                    id: election.id,
                    title: election.name,
                    subtitle: `${new Date(election.start_date).toLocaleDateString()} - ${new Date(election.end_date).toLocaleDateString()}`,
                    href: `/admin/elections`
                });
            });

            // Add positions to results
            globalSearchData.data.positions?.forEach(position => {
                results.push({
                    type: 'position',
                    id: position.id,
                    title: position.name,
                    subtitle: position.election_name || 'Position',
                    href: `/admin/positions`
                });
            });

            setSearchResults(results);
            setShowResults(searchQuery.length >= 2 && results.length > 0);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [globalSearchData, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value.length < 2) {
            setShowResults(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        setShowResults(false);
        setSearchQuery('');
        router.push(result.href);
    };

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

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'student': return Users;
            case 'election': return Trophy;
            case 'position': return Vote;
            default: return Search;
        }
    };

    return (
        <header className="sticky top-0 z-30 border-b border-white/20 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-6 gap-2">
                {/* Search */}
                <div className="flex-1 max-w-xl relative" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search students, elections, positions..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery.length >= 2 && searchResults.length > 0 && setShowResults(true)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-center text-white/60">
                                    No results found for "{searchQuery}"
                                </div>
                            ) : (
                                <div className="py-2">
                                    {searchResults.slice(0, 8).map((result) => {
                                        const Icon = getResultIcon(result.type);
                                        return (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    result.type === 'student' && "bg-blue-500/20 text-blue-400",
                                                    result.type === 'election' && "bg-purple-500/20 text-purple-400",
                                                    result.type === 'position' && "bg-green-500/20 text-green-400"
                                                )}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-white truncate">{result.title}</div>
                                                    <div className="text-sm text-white/60 truncate">{result.subtitle}</div>
                                                </div>
                                                <div className="text-xs text-white/40 capitalize">{result.type}</div>
                                            </button>
                                        );
                                    })}
                                    {searchResults.length > 8 && (
                                        <div className="px-4 py-2 text-center text-white/60 text-sm">
                                            and {searchResults.length - 8} more results...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
                        <div className="relative group">
                            <Link className="text-right hidden sm:block" role='button'
                                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                                <p className="text-xs text-white/60">Administrator</p>
                            </Link>
                            
                            {/* Glassmorphic tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                                <p className="text-sm text-white font-medium">Go to Super Admin</p>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/20"></div>
                            </div>
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
