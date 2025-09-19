import { PrismaClient } from '@prisma/client';
export declare abstract class BaseService {
    protected static prisma: PrismaClient;
    protected static handleNotFound(entity: any, entityName: string, id: string): any;
    protected static calculatePagination(page: number, limit: number, total: number): {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    protected static getPaginationParams(page: number, limit: number): {
        skip: number;
        take: number;
    };
    protected static removeUndefinedProperties<T extends Record<string, any>>(obj: T): Partial<T>;
}
//# sourceMappingURL=base.service.d.ts.map