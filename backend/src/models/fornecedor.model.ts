import { Prisma } from "@prisma/client";
//import { prisma } from '../prisma';
import { prisma } from "../lib/prisma";

export class FornecedorModel {
  static async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FornecedorWhereInput;
    orderBy?: Prisma.FornecedorOrderByWithRelationInput;
    include?: Prisma.FornecedorInclude;
  }) {
    return prisma.fornecedor.findMany(params);
  }

  static async findUnique(params: {
    where: Prisma.FornecedorWhereUniqueInput;
    include?: Prisma.FornecedorInclude;
  }) {
    return prisma.fornecedor.findUnique(params);
  }

  static async create(data: Prisma.FornecedorCreateInput) {
    return prisma.fornecedor.create({ data });
  }

  static async update(params: {
    where: Prisma.FornecedorWhereUniqueInput;
    data: Prisma.FornecedorUpdateInput;
  }) {
    return prisma.fornecedor.update(params);
  }

  static async delete(where: Prisma.FornecedorWhereUniqueInput) {
    return prisma.fornecedor.delete({ where });
  }

  static async count(where?: Prisma.FornecedorWhereInput) {
    if (where) {
      return prisma.fornecedor.count({ where });
    }
    return prisma.fornecedor.count();
  }

  static async findByDocumento(documento: string) {
    return prisma.fornecedor.findUnique({
      where: { documento },
    });
  }

  static async updateSaldo(id: string, novoSaldo: number) {
    return prisma.fornecedor.update({
      where: { id },
      data: { saldo: novoSaldo },
    });
  }

  static async aggregate(params: {
    where?: Prisma.FornecedorWhereInput;
    _sum?: Prisma.FornecedorSumAggregateInputType;
    _count?: Prisma.FornecedorCountAggregateInputType;
  }) {
    return prisma.fornecedor.aggregate(params);
  }
}
