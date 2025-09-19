"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.CustomError = void 0;
const zod_1 = require("zod");
const response_1 = require("../lib/response");
class CustomError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (error, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    if (error instanceof zod_1.ZodError) {
        return response_1.ResponseHelper.error(res, "Dados de entrada inválidos", 400, error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        })));
    }
    if (error.message.includes("duplicate key") ||
        error.message.includes("unique constraint")) {
        return response_1.ResponseHelper.error(res, "Registro duplicado", 409);
    }
    if (error.message.includes("not found") ||
        error.message.includes("does not exist")) {
        return response_1.ResponseHelper.error(res, "Registro não encontrado", 404);
    }
    if (error.message.includes("foreign key") ||
        error.message.includes("constraint")) {
        return response_1.ResponseHelper.error(res, "Violação de chave estrangeira", 400);
    }
    if ("statusCode" in error && error.statusCode) {
        return response_1.ResponseHelper.error(res, error.message, error.statusCode);
    }
    return response_1.ResponseHelper.error(res, process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : error.message, 500);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res) => {
    return response_1.ResponseHelper.error(res, `Rota ${req.method} ${req.originalUrl} não encontrada`, 404);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map