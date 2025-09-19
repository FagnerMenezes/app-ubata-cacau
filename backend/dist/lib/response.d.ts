import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class ResponseHelper {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
    static error(res: Response, error: string, statusCode?: number, details?: any): Response;
    static paginated<T>(res: Response, data: T[], pagination: PaginatedResponse<T>['pagination'], message?: string): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static noContent(res: Response, message?: string): Response;
}
//# sourceMappingURL=response.d.ts.map