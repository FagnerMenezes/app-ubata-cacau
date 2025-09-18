import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
//import { CreateTicketData, UpdateTicketData } from '../types/ticket';

export class TicketModel {
  static async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TicketWhereInput;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
    include?: Prisma.TicketInclude;
  }) {
    return prisma.ticket.findMany(params);
  }

  static async findUnique(params: {
    where: Prisma.TicketWhereUniqueInput;
    include?: Prisma.TicketInclude;
  }) {
    return prisma.ticket.findUnique(params);
  }

  static async create(data: any) {
    const pesoLiquido = data.pesoBruto - data.tara;

    return prisma.ticket.create({
      data: {
        fornecedorId: data.fornecedorId,
        pesoBruto: data.pesoBruto,
        //tara: data.tara,
        pesoLiquido,
        observacoes: data.observacoes,

        status: "CONVERTIDO",
      },
      include: {
        fornecedor: {
          select: {
            id: true,
            nome: true,
            documento: true,
          },
        },
      },
    });
  }

  static async update(params: {
    where: Prisma.TicketWhereUniqueInput;
    data: any;
  }) {
    // Se estiver atualizando peso bruto ou tara, recalcular peso líquido
    if (params.data.pesoBruto !== undefined || params.data.tara !== undefined) {
      const ticket = await prisma.ticket.findUnique({
        where: params.where,
      });

      if (ticket) {
        const pesoBruto = params.data.pesoBruto ?? ticket.pesoBruto;
        const tara = params.data.tara ?? ticket.pesoBruto;
        params.data.pesoLiquido = pesoBruto.toNumber() - tara.toNumber();
      }
    }

    return prisma.ticket.update(params);
  }

  static async delete(where: Prisma.TicketWhereUniqueInput) {
    return prisma.ticket.delete({ where });
  }

  static async count(where?: Prisma.TicketWhereInput) {
    return prisma.ticket.count({ where: where || {} });
  }

  static async findPendentes() {
    return prisma.ticket.findMany({
      where: {
        status: "PENDENTE",
        compra: null,
      },
      include: {
        fornecedor: {
          select: {
            id: true,
            nome: true,
            documento: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: "PESADO" | "CONVERTIDO") {
    return prisma.ticket.update({
      where: { id },
      //@ts-expect-error err
      data: { status: status },
    });
  }

  static async aggregate(params: {
    where?: Prisma.TicketWhereInput;
    _sum?: Prisma.TicketSumAggregateInputType;
    _count?: Prisma.TicketCountAggregateInputType;
  }) {
    return prisma.ticket.aggregate(params);
  }
}
