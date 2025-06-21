export interface StackResponse <T> {
    message: string
    data: T
    error: { message?: string, detail?: any } | null
    status: number
}

export interface PaginatedStackResponse <T> {
    count: number
    next: string
    previous: string
    message: string
    data: T
    status: number
    error: { message?: string, detail?: any } | null
}