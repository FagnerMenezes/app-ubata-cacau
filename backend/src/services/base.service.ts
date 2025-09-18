import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CustomError } from '../middleware/error.middleware';

export abstract class BaseService {
  protected static prisma: PrismaClient = prisma;

  protected static handleNotFound(entity: any, entityName: string, id: string) {
    if (!entity) {
      throw new CustomError(`${entityName} com ID ${id} não encontrado`, 404);
    }
    return entity;
  }

  protected static calculatePagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  protected static getPaginationParams(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Remove propriedades undefined de um objeto para compatibilidade com exactOptionalPropertyTypes
   */
  protected static removeUndefinedProperties<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    
    return result;
  }
}