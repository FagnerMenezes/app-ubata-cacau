"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
class BaseService {
    static prisma = prisma_1.prisma;
    static handleNotFound(entity, entityName, id) {
        if (!entity) {
            throw new error_middleware_1.CustomError(`${entityName} com ID ${id} não encontrado`, 404);
        }
        return entity;
    }
    static calculatePagination(page, limit, total) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    static getPaginationParams(page, limit) {
        return {
            skip: (page - 1) * limit,
            take: limit,
        };
    }
    static removeUndefinedProperties(obj) {
        const result = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                result[key] = obj[key];
            }
        }
        return result;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base.service.js.map