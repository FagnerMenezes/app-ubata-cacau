import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class CompraModel {
  static async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CompraWhereInput;
    orderBy?: Prisma.CompraOrderByWithRelationInput;
    include?: Prisma.CompraInclude;
  }) {
    return prisma.compra.findMany(params);
  }

  static async findUnique(params: {
    where: Prisma.CompraWhereUniqueInput;
    include?: Prisma.CompraInclude;
  }) {
    return prisma.compra.findUnique(params);
  }

  static async create(data: Prisma.CompraCreateInput) {
    return prisma.compra.create({
      data,
      include: {
        fornecedor: {
          select: {
            id: true,
            nome: true,
            documento: true,
          },
        },
        ticket: {
          select: {
            id: true,
            pesoLiquido: true,
            pesoBruto: true,
          },
        },
      },
    });
  }

  static async update(params: {
    where: Prisma.CompraWhereUniqueInput;
    data: Prisma.CompraUpdateInput;
  }) {
    return prisma.compra.update(params);
  }

  static async delete(where: Prisma.CompraWhereUniqueInput) {
    return prisma.compra.delete({ where });
  }

  static async count(params?: { where?: Prisma.CompraWhereInput }) {
    return prisma.compra.count(params);
  }
}