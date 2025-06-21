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

export interface Student extends BaseEntity, TimestampedEntity {
    matric_number: string;
    full_name: string;
    level: StudentLevel;
    state_of_origin: string;
    email?: string;
    phone_number?: string;
    picture?: string;
    status: StudentStatus;
    is_active: boolean;
    date_joined: string;
}

// Election related types
export interface Election extends BaseEntity {
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    positions: Position[];
}

export interface Position extends BaseEntity {
    name: string;
    election_name?: string;
    has_voted?: boolean;
    candidate_count?: number;
    election?: string; // Election ID
}

// Candidate related types
export interface CandidateStudent {
    full_name: string;
    picture?: string;
}

export interface Candidate extends BaseEntity {
    student: CandidateStudent;
    bio?: string;
    photo?: string;
}

export interface DynamicCandidate {
    id: string;
    full_name: string;
    picture?: string;
    bio?: string;
    photo?: string;
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
    vote_count: number;
}

export interface ElectionResultPosition {
    position_id: string;
    position_name: string;
    candidates: ElectionResultCandidate[];
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
        photo?: string;
        vote_count?: number; // Optional, if vote count is needed
    }[];
}

export type ElectionResults = ElectionResultPosition[];

// API endpoint response types
export type LoginResponse = ApiResponse<TokenPair>;
export type RefreshTokenResponse = ApiResponse<{ access: string }>;
export type LogoutResponse = ApiResponse<{}>;
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
    photo?: File;
}