import { CreateCompraInput } from "../types";
import { BaseService } from "./base.service";
import { CompraModel } from "../models/compra.model";
import { TicketModel } from "../models/ticket.model";
import { CustomError } from "../middleware/error.middleware";
import type { 
  Compra, 
  Ticket, 
  Fornecedor, 
  Pagamento,
  Prisma 
} from "@prisma/client";

// Remover estas linhas (4-8):
// class CustomError extends Error {
//   constructor(public message: string, public statusCode: number) {
//     super(message);
//     this.name = "CustomError";
//   }
// }

export class CompraService extends BaseService {
  static async listarCompras(params: {
    page?: number;
    limit?: number;
    fornecedorId?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
    dataInicio?: string;
    dataFim?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      fornecedorId,
      statusPagamento,
      dataInicio,
      dataFim,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (fornecedorId) {
      where.fornecedorId = fornecedorId;
    }

    if (statusPagamento) {
      where.statusPagamento = statusPagamento;
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

    const [compras, total] = await Promise.all([
      this.prisma.compra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          pagamentos: {
            select: {
              id: true,
              valorPago: true,
              // data: true,
            },
          },
        },
      }),
      this.prisma.compra.count({ where }),
    ]);

    return {
      compras,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async buscarPorId(id: string) {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
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
        pagamentos: true,
      },
    });

    return this.handleNotFound(compra, "Compra", id);
  }

  static async converterTicket(data: CreateCompraInput) {
    try {
      // Usar transação para garantir consistência
      return await this.prisma.$transaction(async (tx) => {
        // Verificar se o ticket existe e não foi convertido
        const ticket = await tx.ticket.findUnique({
          where: { id: data.ticketId },
          include: { compra: true, fornecedor: true },
        });

        if (!ticket) {
          throw new CustomError("Ticket não encontrado", 404);
        }

        if (ticket.compra) {
          throw new CustomError("Ticket já foi convertido em compra", 400);
        }

        // Calcular valores
        const pesoLiquido = Number(ticket.pesoLiquido);

        // Calcular preço por kg com base no preço por arroba (1 arroba = 15 kg)
        const precoPorKg = data.precoPorArroba / 15;
        const valorTotal = pesoLiquido * precoPorKg;

        // Criar a compra
        const compra = await tx.compra.create({
          data: {
            ticketId: data.ticketId,
            fornecedorId: ticket.fornecedorId,
            precoPorArroba: data.precoPorArroba,
            precoPorKg: precoPorKg,
            valorTotal,
            statusPagamento: "PENDENTE",
          },
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
                status: true,
              },
            },
          },
        });

        // Atualizar status do ticket para CONVERTIDO
        await tx.ticket.update({
          where: { id: data.ticketId },
          data: { status: "CONVERTIDO" },
        });

        return compra;
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao converter ticket em compra", 500);
    }
  }

  static async atualizar(id: string, data: Partial<CreateCompraInput>) {
    try {
      // Verificar se a compra existe
      const compraExistente = await this.prisma.compra.findUnique({
        where: { id },
        include: { ticket: true, pagamentos: true },
      });

      if (!compraExistente) {
        throw new CustomError("Compra não encontrada", 404);
      }

      // Verificar se há pagamentos - permitir apenas edição de observações
      const temPagamentos = compraExistente.pagamentos && compraExistente.pagamentos.length > 0;

      if (temPagamentos) {
        // Se tem pagamentos, só permitir edição de observações
        const camposProibidos = Object.keys(data).filter(key => key !== 'observacoes');
        if (camposProibidos.length > 0) {
          throw new CustomError(
            "Compra com pagamentos só permite edição do campo observações",
            400
          );
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        let updateData: any = {};

        // Se tem pagamentos, só permitir observações
        if (temPagamentos) {
          if (data.observacoes !== undefined) {
            updateData.observacoes = data.observacoes;
          }
        } else {
          // Se não tem pagamentos, permitir todas as alterações
          if (data.observacoes !== undefined) {
            updateData.observacoes = data.observacoes;
          }

          // Se o preço por arroba foi alterado, recalcular valores
          if (data.precoPorArroba && data.precoPorArroba !== Number(compraExistente.precoPorArroba)) {
            const pesoLiquido = Number(compraExistente.ticket.pesoLiquido);
            const precoPorKg = data.precoPorArroba / 15;
            updateData.precoPorArroba = data.precoPorArroba;
            updateData.precoPorKg = precoPorKg;
            updateData.valorTotal = pesoLiquido * precoPorKg;
          }
        }

        // Atualizar a compra
        const compraAtualizada = await tx.compra.update({
          where: { id },
          data: updateData,
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
                status: true,
              },
            },
            pagamentos: true,
          },
        });

        return compraAtualizada;
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar compra", 500);
    }
  }

  static async deletar(id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Verificar se a compra existe
        const compra = await tx.compra.findUnique({
          where: { id },
          include: {
            ticket: true,
            pagamentos: true
          },
        });

        if (!compra) {
          throw new CustomError("Compra não encontrada", 404);
        }

        // Verificar se há pagamentos associados
        if (compra.pagamentos && compra.pagamentos.length > 0) {
          throw new CustomError(
            "Não é possível deletar compra com pagamentos associados",
            409
          );
        }

        // Deletar a compra
        await tx.compra.delete({
          where: { id },
        });

        // Reverter o status do ticket para PENDENTE
        await tx.ticket.update({
          where: { id: compra.ticketId },
          data: { status: "PENDENTE" },
        });

        return { message: "Compra deletada com sucesso" };
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar compra", 500);
    }
  }

  static async obterEstatisticas(periodo?: string) {
    try {
      const whereCondition: any = {};

      // Filtrar por período se especificado
      if (periodo) {
        const agora = new Date();
        let dataInicio: Date;

        switch (periodo) {
          case "mes":
            dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
            break;
          case "trimestre":
            dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 3, 1);
            break;
          case "ano":
            dataInicio = new Date(agora.getFullYear(), 0, 1);
            break;
          default:
            dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        }

        whereCondition.createdAt = {
          gte: dataInicio,
        };
      }

      const [totalCompras, valorTotal, comprasPendentes, comprasPagas] = await Promise.all([
        this.prisma.compra.count({ where: whereCondition }),
        this.prisma.compra.aggregate({
          where: whereCondition,
          _sum: { valorTotal: true },
        }),
        this.prisma.compra.count({
          where: { ...whereCondition, statusPagamento: "PENDENTE" },
        }),
        this.prisma.compra.count({
          where: { ...whereCondition, statusPagamento: "PAGO" },
        }),
      ]);

      return {
        totalCompras,
        valorTotal: Number(valorTotal._sum.valorTotal) || 0,
        comprasPendentes,
        comprasPagas,
      };
    } catch (error) {
      throw new CustomError("Erro ao obter estatísticas", 500);
    }
  }
}
