import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    Position, 
    ElectionPositions, 
    VoteFormData,
    AdminDashboardData,
    StudentAnalytics,
    PositionAnalytics,
    VotingLog,
    CandidateStatistics,
    ModerationCandidate,
    BulkImportResult,
    BulkPositionCreateData,
    Student
} from "@/@types/db";
import { 
    getPositions, 
    getPosition, 
    getActiveElection, 
    voteCandidate,
    getAdminDashboard,
    getStudentAnalytics,
    getPositionAnalytics,
    getVotingLogs,
    getCandidateStatistics,
    getModerationQueue,
    bulkImportStudents,
    exportStudents,
    exportVotes,
    resetStudentPassword,
    toggleStudentStatus,
    bulkCreatePositions,
    getAllStudents,
    createElection,
    toggleElectionStatus,
    updateElection,
    deleteElection,
    globalSearch,
} from "../server/api";

export const QUERY_KEYS = {
    get_positions: 'get_positions',
    get_position: 'get_position',
    get_active_election: 'get_active_election',
    // Admin query keys
    admin_dashboard: 'admin_dashboard',
    student_analytics: 'student_analytics',
    position_analytics: 'position_analytics',
    voting_logs: 'voting_logs',
    candidate_statistics: 'candidate_statistics',
    moderation_queue: 'moderation_queue',
    all_students: 'all_students',
    global_search: 'global_search',
}

export const usePositions = () => useQuery({
    queryKey: [QUERY_KEYS.get_positions],
    queryFn: async () => getPositions(),
})

export const usePosition = (positionId: string) => useQuery({
    queryKey: [QUERY_KEYS.get_position, positionId],
    queryFn: async () => getPosition(positionId),
    enabled: !!positionId,
})

export const useActiveElection = () => useQuery({
    queryKey: [QUERY_KEYS.get_active_election],
    queryFn: async () => getActiveElection(),
})

export const useVoteCandidate = () => useMutation({
    mutationFn: async (voteData: VoteFormData) => voteCandidate(voteData),
})

// Admin hooks
export const useAdminDashboard = () => useQuery({
    queryKey: [QUERY_KEYS.admin_dashboard],
    queryFn: async () => getAdminDashboard(),
})

export const useStudentAnalytics = () => useQuery({
    queryKey: [QUERY_KEYS.student_analytics],
    queryFn: async () => getStudentAnalytics(),
})

export const usePositionAnalytics = (positionId: string) => useQuery({
    queryKey: [QUERY_KEYS.position_analytics, positionId],
    queryFn: async () => getPositionAnalytics(positionId),
    enabled: !!positionId,
})

export const useVotingLogs = (params?: {
    election?: string;
    position?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
}) => useQuery({
    queryKey: [QUERY_KEYS.voting_logs, params],
    queryFn: async () => getVotingLogs(params),
})

export const useCandidateStatistics = () => useQuery({
    queryKey: [QUERY_KEYS.candidate_statistics],
    queryFn: async () => getCandidateStatistics(),
})

export const useModerationQueue = () => useQuery({
    queryKey: [QUERY_KEYS.moderation_queue],
    queryFn: async () => getModerationQueue(),
})

export const useAllStudents = (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    level?: number;
    status?: string;
}) => useQuery({
    queryKey: [QUERY_KEYS.all_students, params],
    queryFn: async () => getAllStudents(params),
})

// Admin mutations
export const useBulkImportStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => bulkImportStudents(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all_students] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.student_analytics] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admin_dashboard] });
        }
    });
}

export const useExportStudents = () => useMutation({
    mutationFn: async () => exportStudents(),
})

export const useExportVotes = () => useMutation({
    mutationFn: async (electionId?: string) => exportVotes(electionId),
})

export const useResetStudentPassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ studentId, newPassword }: { studentId: string; newPassword: string }) => 
            resetStudentPassword(studentId, newPassword),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all_students] });
        }
    });
}

export const useToggleStudentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (studentId: string) => toggleStudentStatus(studentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.all_students] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.student_analytics] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admin_dashboard] });
        }
    });
}

export const useBulkCreatePositions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: BulkPositionCreateData) => bulkCreatePositions(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_positions] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_active_election] });
        }
    });
}

// Election management mutations
export const useCreateElection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; start_date: string; end_date: string, type?: 'general' | 'specific' }) => 
            createElection(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elections'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admin_dashboard] });
        }
    });
}

export const useToggleElectionStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (electionId: string) => toggleElectionStatus(electionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elections'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_active_election] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admin_dashboard] });
        }
    });
}

export const useUpdateElection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ electionId, data }: { 
            electionId: string; 
            data: { name?: string; start_date?: string; end_date?: string, type?: 'general' | 'specific' } 
        }) => updateElection(electionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elections'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_active_election] });
        }
    });
}

export const useDeleteElection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (electionId: string) => deleteElection(electionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elections'] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admin_dashboard] });
        }
    });
}

export const useGlobalSearch = (query: string) => useQuery({
    queryKey: [QUERY_KEYS.global_search, query],
    queryFn: async () => globalSearch(query),
    enabled: !!query,
});