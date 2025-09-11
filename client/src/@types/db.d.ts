// Base types for common fields
export interface BaseEntity {
    id: string;
    created_at?: string;
    updated_at?: string;
}

export interface TimestampedEntity {
    date_joined?: string;
    voted_at?: string;
}

// Student related types
export type StudentLevel = 100 | 200 | 300 | 400 | 500;
export type StudentStatus = 'active' | 'graduated' | 'inactive';
export type Gender = 'male' | 'female' | 'other';

export interface Student extends BaseEntity, TimestampedEntity {
    matric_number: string;
    full_name: string;
    level: StudentLevel;
    state_of_origin: string;
    email?: string;
    phone_number?: string;
    picture?: string;
    gender: Gender;
    status: StudentStatus;
    is_active: boolean;
    is_staff: boolean;
    is_superuser?: boolean;
    is_verified?: boolean;
    has_changed_password?: boolean;
    date_of_birth?: string; // YYYY-MM-DD
    date_joined: string;
}

// Election related types
export interface Election extends BaseEntity {
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    type?: 'general' | 'specific';
    positions: Position[];
}

export interface Position extends BaseEntity {
    name: string;
    election_name?: string;
    has_voted?: boolean;
    vote_count?: number;
    candidate_count?: number;
    election?: string;
    gender_restriction: 'any' | 'male' | 'female';
    position_type: 'senior' | 'junior';
}

// Candidate related types
export interface CandidateStudent {
    full_name: string;
    picture?: string;
    alias?: string;
}

export interface Candidate extends BaseEntity {
    student: CandidateStudent;
    position: string;
    bio?: string;
    photo?: string;
    alias?: string;
    position_name?: string;
    election_name?: string;
}

export interface DynamicCandidate {
    id: string;
    full_name: string;
    picture?: string;
    bio?: string;
    photo?: string;
    alias?: string;
}

// Vote related types
export interface Vote extends BaseEntity {
    voter: string; // Student ID
    position: string; // Position ID
    student_voted_for: string; // Student ID
}

// Authentication types
export interface TokenPair {
    access: string;
    refresh: string;
}

export interface LoginCredentials {
    matric_number: string;
    password: string;
}

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: {
        detail: string;
        [key: string]: any;
    };
}

// Election results types
export interface ElectionResultCandidate {
    student_id: string;
    student_name: string;
    picture?: string;
    vote_count: number;
}

export interface ElectionResultPosition {
    position_id: string;
    position_name: string;
    candidates: ElectionResultCandidate[];
}

export interface RecentWinner {
    position_name: string;
    winner_name: string;
    winner_picture?: string;
    vote_count: number;
    election_name: string;
    election_year: number;
}

export interface ElectionPositions extends Election {
    positions: Position[];
}

export interface PositionCandidates extends Position {
    candidates: {
        id: string;
        full_name: string;
        picture?: string;
        bio?: string;
        alias?: string;
        photo?: string;
        vote_count?: number; // Optional, if vote count is needed
    }[];
}

export type ElectionResults = ElectionResultPosition[];
export type RecentWinnersResponse = ApiResponse<RecentWinner[]>;

// API endpoint response types
export type LoginResponse = ApiResponse<TokenPair>;
export type RefreshTokenResponse = ApiResponse<{ access: string }>;
// Use Record<string, never> instead of {} to satisfy no-empty-object-type
export type LogoutResponse = ApiResponse<Record<string, never>>;
export type CurrentUserResponse = ApiResponse<Student>;
export type StudentsResponse = ApiResponse<Student[]>;
export type ElectionsResponse = ApiResponse<Election[]>;
export type ActiveElectionResponse = ApiResponse<Election>;
export type PositionsResponse = ApiResponse<Position[]>;
export type CandidatesResponse = ApiResponse<Candidate[]>;
export type DynamicCandidatesResponse = ApiResponse<DynamicCandidate[]>;
export type VoteResponse = ApiResponse<Vote>;
export type ElectionResultsResponse = ApiResponse<ElectionResults>;

// Form data types
export interface VoteFormData {
    position: string;
    student_voted_for: string;
}

export interface CandidateFormData {
    position: string;
    bio?: string;
    alias?: string;
    photo?: File | null;
    student_id?: string | null; // admin override
}

export interface CandidateUpdateFormData {
    bio?: string;
    alias?: string;
    photo?: File | null;
    remove_photo?: boolean;
}

export type CandidateResponse = ApiResponse<Candidate>;
export type CandidatesListResponse = ApiResponse<Candidate[]>;

// Admin specific types
export interface AdminDashboardData {
    overview: {
        total_students: number;
        active_students: number;
        total_elections: number;
        active_elections: number;
        total_votes: number;
    };
    recent_activity: {
        new_votes: number;
        new_students: number;
        new_candidates: number;
    };
    current_election: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
        positions_count: number;
        total_votes: number;
        eligible_voters: number;
        participation_rate: number;
    } | null;
}

export interface StudentAnalytics {
    totals: {
        total_students: number;
        active_students: number;
        eligible_candidates: number;
    };
    distributions: {
        by_level: { level: number; count: number }[];
        by_gender: { gender: string; count: number }[];
        by_status: { status: string; count: number }[];
    };
}

export interface PositionAnalytics {
    position_name: string;
    total_votes: number;
    eligible_voters: number;
    participation_rate: number;
    vote_breakdown: {
        student_voted_for__full_name: string;
        student_voted_for__gender: string;
        vote_count: number;
        picture?: string
    }[];
    vote_timeline: { hour: number; count: number }[];
    voter_demographics: { voter__gender: string; count: number }[];
}

export interface VotingLog {
    id: string;
    voter_name: string;
    voter_matric: string;
    candidate_name: string;
    candidate_matric: string;
    position: string;
    election: string;
    voted_at: string;
}

export interface CandidateStatistics {
    total_candidates: number;
    complete_profiles: number;
    completion_rate: number;
    distribution: {
        by_election: { position__election__name: string; count: number }[];
        by_position: { position__name: string; count: number }[];
        by_gender: { student__gender: string; count: number }[];
    };
}

export interface ModerationCandidate {
    id: string;
    student_name: string;
    student_matric: string;
    position: string;
    election: string;
    missing_bio: boolean;
    missing_photo: boolean;
    created_at: string;
}

// Bulk import types
export interface BulkImportResult {
    created_count: number;
    skipped?: number;
    errors: string[];
    time_seconds?: number;
    avg_ms_per_created?: number | null;
}

export interface BulkPositionCreateData {
    election_id: string;
    positions: {
        name: string;
        gender_restriction?: 'any' | 'male' | 'female';
    }[];
}

// Admin API response types
export type AdminDashboardResponse = ApiResponse<AdminDashboardData>;
export type StudentAnalyticsResponse = ApiResponse<StudentAnalytics>;
export type PositionAnalyticsResponse = ApiResponse<PositionAnalytics>;
export type VotingLogsResponse = ApiResponse<VotingLog[]>;
export type CandidateStatisticsResponse = ApiResponse<CandidateStatistics>;
export type ModerationQueueResponse = ApiResponse<ModerationCandidate[]>;
export type BulkImportResponse = ApiResponse<BulkImportResult>;

// Global search types
export interface GlobalSearchResults {
    students: Student[];
    elections: Election[];
    positions: Position[];
}

export type GlobalSearchResponse = ApiResponse<GlobalSearchResults>;

// Password reset types
export interface ChangePasswordCredentials {
    matric_number: string;
    old_password: string;
    new_password: string;
    confirm_password?: string;
    date_of_birth: string; // YYYY-MM-DD
}