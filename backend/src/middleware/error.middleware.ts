import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ResponseHelper } from '../lib/response';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    return ResponseHelper.error(
      res,
      'Dados de entrada inválidos',
      400,
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return ResponseHelper.error(res, 'Registro duplicado', 409, {
          field: error.meta?.target,
        });
      case 'P2025':
        return ResponseHelper.error(res, 'Registro não encontrado', 404);
      case 'P2003':
        return ResponseHelper.error(res, 'Violação de chave estrangeira', 400);
      case 'P2014':
        return ResponseHelper.error(res, 'Violação de relacionamento', 400);
      default:
        return ResponseHelper.error(res, 'Erro no banco de dados', 500);
    }
  }

  // Custom application errors
  if ('statusCode' in error && error.statusCode) {
    return ResponseHelper.error(res, error.message, error.statusCode);
  }

  // Default server error
  return ResponseHelper.error(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
    500
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ResponseHelper.error(
    res,
    `Rota ${req.method} ${req.originalUrl} não encontrada`,
    404
  );
};