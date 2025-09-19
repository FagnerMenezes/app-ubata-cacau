import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const errorHandler: (error: Error | AppError | ZodError, req: Request, res: Response, next: NextFunction) => Response;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => Response;
//# sourceMappingURL=error.middleware.d.ts.map