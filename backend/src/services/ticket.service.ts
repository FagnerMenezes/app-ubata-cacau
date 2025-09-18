import { Prisma } from "@prisma/client";
import { CustomError } from "../middleware/error.middleware";
import { CreateTicketInput, TicketQuery, UpdateTicketInput } from "../types";
import { BaseService } from "./base.service";

export class TicketService extends BaseService {
  static async create(data: CreateTicketInput) {
    // Verificar se o fornecedor existe
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id: data.fornecedorId },
    });

    if (!fornecedor) {
      throw new CustomError("Fornecedor não encontrado", 404);
    }

    // Validar pesos
    if (data.pesoLiquido > data.pesoBruto) {
      throw new CustomError(
        "Peso líquido não pode ser maior que peso bruto",
        400
      );
    }

    // Criar objeto apenas com propriedades definidas
    const createData: Prisma.TicketCreateInput = {
      fornecedor: {
        connect: { id: data.fornecedorId },
      },
      pesoBruto: new Prisma.Decimal(data.pesoBruto),
      pesoLiquido: new Prisma.Decimal(data.pesoLiquido),
    };

    // Adicionar observacoes apenas se estiver definido
    if (data.observacoes !== undefined) {
      createData.observacoes = data.observacoes;
    }

    return await this.prisma.ticket.create({
      data: createData,
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

  static async findAll(query: TicketQuery) {
    const { page, limit, fornecedorId, status, dataInicio, dataFim } = query;
    const { skip, take } = this.getPaginationParams(page, limit);

    const where: Prisma.TicketWhereInput = {};

    if (fornecedorId) {
      where.fornecedorId = fornecedorId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim);
      }
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          fornecedor: {
            select: {
              id: true,
              nome: true,
              documento: true,
            },
          },
          compra: {
            select: {
              id: true,
              valorTotal: true,
              precoPorKg: true,
              statusPagamento: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: this.calculatePagination(page, limit, total),
    };
  }

  static async findAvailable() {
    return await this.prisma.ticket.findMany({
      where: {
        status: "PENDENTE",
        compra: null, // Tickets que não foram convertidos em compra
      },
      orderBy: { createdAt: "desc" },
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

  static async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        fornecedor: {
          select: {
            id: true,
            nome: true,
            documento: true,
          },
        },
        compra: {
          include: {
            pagamentos: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    return this.handleNotFound(ticket, "Ticket", id);
  }

  static async update(id: string, data: UpdateTicketInput) {
    try {
      // Verificar se o ticket existe e não foi convertido
      const ticketExistente = await this.prisma.ticket.findUnique({
        where: { id },
        include: { compra: true },
      });

      if (!ticketExistente) {
        throw new CustomError("Ticket não encontrado", 404);
      }

      if (ticketExistente.compra) {
        throw new CustomError(
          "Não é possível editar ticket já convertido em compra",
          400
        );
      }

      // Verificar se há dados para atualizar
      if (!data || Object.keys(data).length === 0) {
        throw new CustomError("Nenhum dado fornecido para atualização", 400);
      }

      // Validar pesos se fornecidos
      const pesoBruto = data.pesoBruto ?? Number(ticketExistente.pesoBruto);
      const pesoLiquido =
        data.pesoLiquido ?? Number(ticketExistente.pesoLiquido);

      if (pesoLiquido > pesoBruto) {
        throw new CustomError(
          "Peso líquido não pode ser maior que peso bruto",
          400
        );
      }

      // Remover propriedades undefined
      const updateData = this.removeUndefinedProperties(data);

      // Verificar se há pelo menos um campo para atualizar
      if (Object.keys(updateData).length === 0) {
        throw new CustomError(
          "Nenhum dado válido fornecido para atualização",
          400
        );
      }

      const ticket = await this.prisma.ticket.update({
        where: { id },
        // Adicionar verificação se fornecedorId está sendo atualizado
        // @ts-expect-error err
        data: updateData,
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

      return ticket;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CustomError("Ticket não encontrado", 404);
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      // Verificar se o ticket existe e não foi convertido
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
        include: { compra: true },
      });

      if (!ticket) {
        throw new CustomError("Ticket não encontrado", 404);
      }

      if (ticket.compra) {
        throw new CustomError(
          "Não é possível excluir ticket já convertido em compra",
          400
        );
      }

      await this.prisma.ticket.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CustomError("Ticket não encontrado", 404);
      }
      throw error;
    }
  }

  static async convertToCompra(ticketId: string, precoPorKg: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Buscar o ticket
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        include: { compra: true },
      });

      if (!ticket) {
        throw new CustomError("Ticket não encontrado", 404);
      }

      if (ticket.compra) {
        throw new CustomError("Ticket já foi convertido em compra", 400);
      }

      // Calcular valores
      const precoPorArroba = precoPorKg * 15; // 1 arroba = 15 kg
      const valorTotal = ticket.pesoLiquido.toNumber() * precoPorKg;

      // Criar a compra
      const compra = await tx.compra.create({
        data: {
          ticketId: ticket.id,
          fornecedorId: ticket.fornecedorId,
          precoPorArroba,
          precoPorKg,
          valorTotal,
        },
        include: {
          ticket: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
              documento: true,
            },
          },
        },
      });

      // Atualizar status do ticket
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: "CONVERTIDO" },
      });

      return compra;
    });
  }
}
