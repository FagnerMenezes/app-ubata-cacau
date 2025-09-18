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

export class ResponseHelper {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>);
  }

  static error(res: Response, error: string, statusCode = 500, details?: any): Response {
    return res.status(statusCode).json({
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginatedResponse<T>['pagination'],
    message?: string
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString(),
    } as PaginatedResponse<T>);
  }

  static created<T>(res: Response, data: T, message = 'Recurso criado com sucesso'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message = 'Operação realizada com sucesso'): Response {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}