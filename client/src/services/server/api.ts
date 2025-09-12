'use server'

import { PaginatedStackResponse, StackResponse } from "@/@types/generics";
import { stackbase } from "../server.entry";
import { 
    ElectionPositions, 
    Position, 
    PositionCandidates, 
    VoteFormData, 
    AdminDashboardData,
    StudentAnalytics,
    PositionAnalytics,
    VotingLog,
    CandidateStatistics,
    ModerationCandidate,
    BulkImportResult,
    BulkPositionCreateData,
    Student,
    Election,
    Candidate,
    CandidateFormData,
    CandidateUpdateFormData
} from "@/@types/db";


export const getPositions = async (params?: {
    q?: string;
    election?: string;
    position_type?: 'senior' | 'junior';
    gender_restriction?: 'any' | 'male' | 'female';
    ordering?: string;
    page?: number;
    page_size?: number;
}): Promise<PaginatedStackResponse<Position[]>> => {
    try {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
            });
        }
        const qs = searchParams.toString();
        const url = `/positions/${qs ? `?${qs}` : ''}`;
        const { data } = await stackbase.get(url);
        return data;
    } catch (error: any) {
        console.error("Error fetching positions:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching positions.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: [],
            count: 0,
            next: '',
            previous: '',
        };
    }
}

export const getPosition = async (positionId: string): Promise<StackResponse<PositionCandidates | null>> => {
    try {
        const { data } = await stackbase.get(`/positions/${positionId}/`);
        console.log(data.data)
        return data;
    } catch (error: any) {
        console.error("Error fetching position:", error);
        return {
        message: error?.response?.error?.detail || "An error occurred while fetching the position.",
        error: error?.response?.data,
        status: error?.response?.status || 500,
        data: null,
        };
    }
}

export const getActiveElection = async (): Promise<StackResponse<ElectionPositions | null>> => {
  try {
    const { data } = await stackbase.get("/elections/active/");
    return data;
  } catch (error: any) {
    console.error("Error fetching active election:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the active election.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const voteCandidate = async (voteData: VoteFormData): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.post(`/votes/`, voteData);
    return data;
  } catch (error: any) {
    console.error("Error voting for candidate:", error);
    return {
      message: error?.response?.data?.message || "An error occurred while voting for the candidate.",
      error: error?.response?.error?.detail || "An unexpected error occurred.",
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getElections = async (params?: {
    q?: string;
    type?: 'general' | 'specific';
    is_active?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
}): Promise<PaginatedStackResponse<ElectionPositions[]>> => {
    try {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
            });
        }
        const qs = searchParams.toString();
        const { data } = await stackbase.get(`/elections/${qs ? `?${qs}` : ''}`);
        return data;
    } catch (error: any) {
        console.error("Error fetching elections:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching elections.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: [],
            count: 0,
            next: '',
            previous: '',
        };
    }
}

export const getElection = async (electionId: string): Promise<StackResponse<ElectionPositions | null>> => {
  try {
    const { data } = await stackbase.get(`/elections/${electionId}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching election:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the election.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getJustConcludedElectionResults = async (): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get("/elections/last-concluded/");
    return data;
  } catch (error: any) {
    console.error("Error fetching active election results:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the last concluded election results.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}


export const getElectionResults = async (electionId: string): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get(`/elections/${electionId}/results/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching election results:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the election results.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getRecentWinners = async (): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get("/elections/recent-winners/");
    return data;
  } catch (error: any) {
    console.error("Error fetching recent winners:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching recent winners.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

// Admin API functions
export const getAdminDashboard = async (): Promise<StackResponse<AdminDashboardData | null>> => {
    try {
        const { data } = await stackbase.get("/admin/dashboard/");
        return data;
    } catch (error: any) {
        console.error("Error fetching admin dashboard:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching dashboard data.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getStudentAnalytics = async (): Promise<StackResponse<StudentAnalytics | null>> => {
    try {
        const { data } = await stackbase.get("/students/analytics/");
        return data;
    } catch (error: any) {
        console.error("Error fetching student analytics:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching student analytics.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getPositionAnalytics = async (positionId: string): Promise<StackResponse<PositionAnalytics | null>> => {
    try {
        const { data } = await stackbase.get(`/positions/${positionId}/vote_analytics/`);
        return data;
    } catch (error: any) {
        console.error("Error fetching position analytics:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching position analytics.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getVotingLogs = async (params?: {
    election?: string;
    position?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
}): Promise<StackResponse<VotingLog[] | null>> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.election) searchParams.append('election', params.election);
        if (params?.position) searchParams.append('position', params.position);
        if (params?.date_from) searchParams.append('date_from', params.date_from);
        if (params?.date_to) searchParams.append('date_to', params.date_to);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.page_size) searchParams.append('page_size', params.page_size.toString());

        const { data } = await stackbase.get(`/votes/voting_logs/?${searchParams.toString()}`);
        return data;
    } catch (error: any) {
        console.error("Error fetching voting logs:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching voting logs.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getCandidateStatistics = async (): Promise<StackResponse<CandidateStatistics | null>> => {
    try {
        const { data } = await stackbase.get("/candidates/statistics/");
        return data;
    } catch (error: any) {
        console.error("Error fetching candidate statistics:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching candidate statistics.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getModerationQueue = async (): Promise<StackResponse<ModerationCandidate[] | null>> => {
    try {
        const { data } = await stackbase.get("/candidates/moderation_queue/");
        return data;
    } catch (error: any) {
        console.error("Error fetching moderation queue:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching moderation queue.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const bulkImportStudents = async (file: File): Promise<StackResponse<BulkImportResult | null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await stackbase.post("/students/bulk_import/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    } catch (error: any) {
        console.error("Error importing students:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while importing students.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const exportStudents = async (): Promise<Blob | null> => {
    try {
        const response = await stackbase.get("/students/export/", { responseType: 'blob' });
        return response.data;
    } catch (error: any) {
        console.error("Error exporting students:", error);
        return null;
    }
}

export const exportVotes = async (electionId?: string): Promise<Blob | null> => {
    try {
        const params = electionId ? `?election=${electionId}` : '';
        const response = await stackbase.get(`/votes/export_votes/${params}`, { responseType: 'blob' });
        return response.data;
    } catch (error: any) {
        console.error("Error exporting votes:", error);
        return null;
    }
}

export const resetStudentPassword = async (studentId: string, newPassword: string): Promise<StackResponse<any>> => {
    try {
        const { data } = await stackbase.post(`/students/${studentId}/reset_password/`, {
            new_password: newPassword
        });
        return data;
    } catch (error: any) {
        console.error("Error resetting password:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while resetting password.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const toggleStudentStatus = async (studentId: string): Promise<StackResponse<any>> => {
    try {
        const { data } = await stackbase.patch(`/students/${studentId}/toggle_status/`);
        return data;
    } catch (error: any) {
        console.error("Error toggling student status:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while toggling student status.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const bulkCreatePositions = async (data: BulkPositionCreateData): Promise<StackResponse<Position[] | null>> => {
    try {
        const { data: response } = await stackbase.post("/positions/bulk_create/", data);
        return response;
    } catch (error: any) {
        console.error("Error creating positions:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while creating positions.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const getAllStudents = async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    level?: number;
    status?: string;
}): Promise<PaginatedStackResponse<Student[]>> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.level) searchParams.append('level', params.level.toString());
        if (params?.status) searchParams.append('status', params.status);

        const { data } = await stackbase.get(`/students/`, { params: searchParams });
        return data;
    } catch (error: any) {
        console.error("Error fetching students:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while fetching students.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: [],
            count: 0,
            next: '',
            previous: '',
        };
    }
}

// Add these election management functions
export const createElection = async (data: {
    name: string;
    start_date: string;
    end_date: string;
    type?: 'general' | 'specific';
}): Promise<StackResponse<Election | null>> => {
    try {
        const { data: response } = await stackbase.post("/elections/", data);
        return response;
    } catch (error: any) {
        console.error("Error creating election:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while creating the election.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const toggleElectionStatus = async (electionId: string): Promise<StackResponse<any>> => {
    try {
        const { data } = await stackbase.patch(`/elections/${electionId}/toggle_status/`);
        return data;
    } catch (error: any) {
        console.error("Error toggling election status:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while toggling election status.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const updateElection = async (electionId: string, data: {
    name?: string;
    start_date?: string;
    end_date?: string;
}): Promise<StackResponse<Election | null>> => {
    try {
        const { data: response } = await stackbase.patch(`/elections/${electionId}/`, data);
        return response;
    } catch (error: any) {
        console.error("Error updating election:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while updating the election.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const deleteElection = async (electionId: string): Promise<StackResponse<any>> => {
    try {
        const { data } = await stackbase.delete(`/elections/${electionId}/`);
        return data;
    } catch (error: any) {
        console.error("Error deleting election:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while deleting the election.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

export const globalSearch = async (query: string): Promise<StackResponse<{
    students: Student[];
    elections: Election[];
    positions: Position[];
} | null>> => {
    try {
        const { data } = await stackbase.get(`/search/?q=${encodeURIComponent(query)}`);
        return data;
    } catch (error: any) {
        console.error("Error performing global search:", error);
        return {
            message: error?.response?.error?.detail || "An error occurred while searching.",
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
}

// Candidate CRUD
export const createCandidate = async (data: CandidateFormData & { student_id?: string | null }): Promise<StackResponse<Candidate | null>> => {
    try {
        const form = new FormData();
        form.append('position', data.position);
        if (data.bio !== undefined) form.append('bio', data.bio);
        if (data.alias !== undefined) form.append('alias', data.alias);
        if (data.photo) form.append('photo', data.photo);
    if (data.student_id) form.append('student_id', data.student_id);
        const { data: response } = await stackbase.post('/candidates/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error: any) {
        console.error('Error creating candidate:', error);
        return {
            message: error?.response?.error?.detail || 'Failed to create candidate.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};

export const updateCandidate = async (id: string, data: CandidateUpdateFormData): Promise<StackResponse<Candidate | null>> => {
    try {
        const form = new FormData();
        if (data.bio !== undefined) form.append('bio', data.bio || '');
        if (data.alias !== undefined) form.append('alias', data.alias || '');
        if (data.photo !== undefined && data.photo !== null) form.append('photo', data.photo);
        if (data.remove_photo) form.append('remove_photo', 'true');
        const { data: response } = await stackbase.patch(`/candidates/${id}/`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error: any) {
        console.error('Error updating candidate:', error);
        return {
            message: error?.response?.error?.detail || 'Failed to update candidate.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};

export const updateCandidatePhoto = async (id: string, photo: File | null, remove = false): Promise<StackResponse<Candidate | null>> => {
    try {
        const form = new FormData();
        if (remove) form.append('remove', 'true');
        if (photo) form.append('photo', photo);
        const { data } = await stackbase.patch(`/candidates/${id}/photo/`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error: any) {
        console.error('Error updating candidate photo:', error);
        return {
            message: error?.response?.error?.detail || 'Failed to update candidate photo.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};

export const deleteCandidate = async (id: string): Promise<StackResponse<Record<string, never> | null>> => {
    try {
        const { data } = await stackbase.delete(`/candidates/${id}/`);
        return data;
    } catch (error: any) {
        console.error('Error deleting candidate:', error);
        return {
            message: error?.response?.error?.detail || 'Failed to delete candidate.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};

// Fetch candidates (optional filters: election, position)
export const getCandidates = async (params?: { election?: string; position?: string; page?: number; page_size?: number; q?: string; gender?: string; missing_bio?: boolean; missing_photo?: boolean; ordering?: string; }): Promise<PaginatedStackResponse<Candidate[]>> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.election) searchParams.append('election', params.election);
        if (params?.position) searchParams.append('position', params.position);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.gender) searchParams.append('gender', params.gender);
    if (params?.missing_bio) searchParams.append('missing_bio', 'true');
    if (params?.missing_photo) searchParams.append('missing_photo', 'true');
    if (params?.ordering) searchParams.append('ordering', params.ordering);
        const qs = searchParams.toString();
        const { data } = await stackbase.get(`/candidates/${qs ? `?${qs}` : ''}`);
        return data;
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        return {
            message: error?.response?.error?.detail || 'Failed to fetch candidates.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: [],
            count: 0,
            next: '',
            previous: '',
        };
    }
};

// Lightweight search endpoints for dropdowns
export const searchStudents = async (q: string, opts?: { level?: number; page?: number; limit?: number }): Promise<StackResponse<any>> => {
    try {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (opts?.level) params.append('level', String(opts.level));
        if (opts?.page) params.append('page', String(opts.page));
        if (opts?.limit) params.append('limit', String(opts.limit));
        const { data } = await stackbase.get(`/students/search/${params.toString() ? `?${params.toString()}` : ''}`);
        return data;
    } catch (error: any) {
        return {
            message: error?.response?.error?.detail || 'Student search failed.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};

export const searchPositions = async (q: string, opts?: { election?: string; page?: number; limit?: number }): Promise<StackResponse<any>> => {
    try {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (opts?.election) params.append('election', opts.election);
        if (opts?.page) params.append('page', String(opts.page));
        if (opts?.limit) params.append('limit', String(opts.limit));
        const { data } = await stackbase.get(`/positions/search/${params.toString() ? `?${params.toString()}` : ''}`);
        return data;
    } catch (error: any) {
        return {
            message: error?.response?.error?.detail || 'Position search failed.',
            error: error?.response?.data,
            status: error?.response?.status || 500,
            data: null,
        };
    }
};