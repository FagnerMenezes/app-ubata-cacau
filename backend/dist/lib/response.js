"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(res, data, message, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    static error(res, error, statusCode = 500, details) {
        return res.status(statusCode).json({
            success: false,
            error,
            details,
            timestamp: new Date().toISOString(),
        });
    }
    static paginated(res, data, pagination, message) {
        return res.status(200).json({
            success: true,
            data,
            pagination,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    static created(res, data, message = 'Recurso criado com sucesso') {
        return this.success(res, data, message, 201);
    }
    static noContent(res, message = 'Operação realizada com sucesso') {
        return res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.ResponseHelper = ResponseHelper;
//# sourceMappingURL=response.js.map