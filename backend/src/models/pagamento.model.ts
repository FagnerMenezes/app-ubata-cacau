import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreatePagamentoInput } from "../types";

export class PagamentoModel {
  static async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PagamentoWhereInput;
    orderBy?: Prisma.PagamentoOrderByWithRelationInput;
    include?: Prisma.PagamentoInclude;
  }) {
    return prisma.pagamento.findMany(params);
  }

  static async findUnique<T extends Prisma.PagamentoInclude>(params: {
    where: Prisma.PagamentoWhereUniqueInput;
    include?: T;
  }): Promise<Prisma.PagamentoGetPayload<{ include: T }> | null> {
    const result = await prisma.pagamento.findUnique(params);
    if (!result) return null;
    return result as Prisma.PagamentoGetPayload<{ include: T }>;
  }

  static async create(data: CreatePagamentoInput) {
    return prisma.pagamento.create({
      data: {
        compraId: data.compraId,
        valorPago: data.valorPago,
      },
      include: {
        compra: {
          include: {
            fornecedor: true,
            ticket: true,
          },
        },
      },
    });
  }

  static async delete(where: Prisma.PagamentoWhereUniqueInput) {
    return prisma.pagamento.delete({ where });
  }

  static async count(where?: Prisma.PagamentoWhereInput) {
    return prisma.pagamento.count({ where: where || {} });
  }

  static async findByCompraId(compraId: string) {
    return prisma.pagamento.findMany({
      where: { compraId },
      orderBy: { createdAt: "asc" },
      include: {
        compra: {
          include: {
            fornecedor: true,
            ticket: true,
          },
        },
      },
    });
  }

  static async findUltimoPagamento(compraId: string) {
    return prisma.pagamento.findFirst({
      where: { compraId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async aggregate(params: {
    where?: Prisma.PagamentoWhereInput;
    _sum?: Prisma.PagamentoSumAggregateInputType;
    _count?: Prisma.PagamentoCountAggregateInputType;
  }) {
    return prisma.pagamento.aggregate(params);
  }

  static async calcularTotalPorCompra(compraId: string): Promise<number> {
    const result = await prisma.pagamento.aggregate({
      where: { compraId },
      _sum: { valorPago: true },
    });

    return Number(result._sum.valorPago || 0);
  }

  static async findPagamentosAnteriores(
    compraId: string,
    dataReferencia: Date
  ) {
    return prisma.pagamento.findMany({
      where: {
        compraId,
        createdAt: { lt: dataReferencia },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findComDetalhesCompletos(pagamentoId: string) {
    return prisma.pagamento.findUnique({
      where: { id: pagamentoId },
      include: {
        compra: {
          include: {
            fornecedor: true,
            ticket: true,
            pagamentos: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
  }
}
