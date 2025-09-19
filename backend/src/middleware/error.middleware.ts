import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ResponseHelper } from "../lib/response";

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
  error: Error | AppError | ZodError,
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
      "Dados de entrada inválidos",
      400,
      error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
    );
  }

  // Database errors (Supabase)
  if (
    error.message.includes("duplicate key") ||
    error.message.includes("unique constraint")
  ) {
    return ResponseHelper.error(res, "Registro duplicado", 409);
  }

  if (
    error.message.includes("not found") ||
    error.message.includes("does not exist")
  ) {
    return ResponseHelper.error(res, "Registro não encontrado", 404);
  }

  if (
    error.message.includes("foreign key") ||
    error.message.includes("constraint")
  ) {
    return ResponseHelper.error(res, "Violação de chave estrangeira", 400);
  }

  // Custom application errors
  if ("statusCode" in error && error.statusCode) {
    return ResponseHelper.error(res, error.message, error.statusCode);
  }

  // Default server error
  return ResponseHelper.error(
    res,
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
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
