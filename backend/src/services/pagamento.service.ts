import { prisma } from "../lib/prisma";
import { CustomError } from "../middleware/error.middleware";
import { CompraModel } from "../models/compra.model";
import { PagamentoModel } from "../models/pagamento.model";
import { CreatePagamentoInput } from "../types";

export class PagamentoService {
  static async listarPagamentos(params: {
    page?: number;
    limit?: number;
    compraId?: string;
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      compraId,
      fornecedorId,
      dataInicio,
      dataFim,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (compraId) {
      where.compraId = compraId;
    }

    if (fornecedorId) {
      where.compra = {
        fornecedorId,
      };
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

    const [pagamentos, total] = await Promise.all([
      PagamentoModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          compra: {
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
                  status: true,
                },
              },
            },
          },
        },
      }),
      PagamentoModel.count(where),
    ]);

    return {
      pagamentos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async buscarPagamentoPorId(id: string) {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
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

    if (!pagamento) {
      throw new CustomError("Pagamento não encontrado", 404);
    }

    // Calcular informações adicionais
    const valorTotalCompra = Number(pagamento.compra.valorTotal);
    const valorTotalPago = pagamento.compra.pagamentos.reduce(
      (total: number, pag) => total + Number(pag.valorPago),
      0
    );
    const saldoRestante = valorTotalCompra - valorTotalPago;

    return {
      ...pagamento,
      compra: {
        ...pagamento.compra,
        valorTotalPago,
        saldoRestante,
      },
    };
  }

  static async criarPagamento(data: CreatePagamentoInput) {
    return prisma.$transaction(async (tx) => {
      // Verificar se a compra existe
      const compra = await tx.compra.findUnique({
        where: { id: data.compraId },
        include: {
          pagamentos: true,
          fornecedor: true,
        },
      });

      if (!compra) {
        throw new CustomError("Compra não encontrada", 404);
      }

      // Validar valor do pagamento
      if (data.valorPago <= 0) {
        throw new CustomError(
          "Valor do pagamento deve ser maior que zero",
          400
        );
      }

      // Calcular valor já pago
      const valorJaPago = compra.pagamentos.reduce(
        (total, pagamento) => total + Number(pagamento.valorPago),
        0
      );

      const valorTotalCompra = Number(compra.valorTotal);
      const saldoRestante = valorTotalCompra - valorJaPago;

      // Verificar se o pagamento não excede o saldo
      if (data.valorPago > saldoRestante) {
        throw new CustomError(
          `Valor do pagamento (R$ ${data.valorPago.toFixed(
            2
          )}) excede o saldo restante (R$ ${saldoRestante.toFixed(2)})`,
          400
        );
      }

      // Criar o pagamento
      const pagamento = await tx.pagamento.create({
        data: data as any,
        include: {
          compra: {
            include: {
              fornecedor: true,
              ticket: true,
            },
          },
        },
      });

      // Calcular novo status da compra
      const novoValorPago = valorJaPago + data.valorPago;
      let novoStatus: "PENDENTE" | "PARCIAL" | "PAGO" = "PENDENTE";

      if (novoValorPago >= valorTotalCompra) {
        novoStatus = "PAGO";
      } else if (novoValorPago > 0) {
        novoStatus = "PARCIAL";
      }

      // Atualizar status da compra
      await tx.compra.update({
        where: { id: data.compraId },
        data: { statusPagamento: novoStatus },
      });

      // Atualizar saldo do fornecedor
      const novoSaldoFornecedor =
        Number(compra.fornecedor.saldo) - data.valorPago;
      await tx.fornecedor.update({
        where: { id: compra.fornecedorId },
        data: { saldo: novoSaldoFornecedor },
      });

      return pagamento;
    });
  }

  static async deletarPagamento(id: string) {
    return prisma.$transaction(async (tx) => {
      // Buscar o pagamento
      const pagamento = await tx.pagamento.findUnique({
        where: { id },
        include: {
          compra: {
            include: {
              fornecedor: true,
              pagamentos: true,
            },
          },
        },
      });

      if (!pagamento) {
        throw new CustomError("Pagamento não encontrado", 404);
      }

      // Verificar se é o último pagamento (para evitar problemas de ordem)
      const ultimoPagamento = await tx.pagamento.findFirst({
        where: { compraId: pagamento.compraId },
        orderBy: { createdAt: "desc" },
      });

      if (ultimoPagamento?.id !== id) {
        throw new CustomError(
          "Apenas o último pagamento pode ser deletado",
          400
        );
      }

      // Deletar o pagamento
      await tx.pagamento.delete({
        where: { id },
      });

      // Recalcular status da compra
      const pagamentosRestantes = pagamento.compra.pagamentos.filter(
        (p) => p.id !== id
      );
      const valorTotalPago = pagamentosRestantes.reduce(
        (total, pag) => total + Number(pag.valorPago),
        0
      );

      const valorTotalCompra = Number(pagamento.compra.valorTotal);
      let novoStatus: "PENDENTE" | "PARCIAL" | "PAGO" = "PENDENTE";

      if (valorTotalPago >= valorTotalCompra) {
        novoStatus = "PAGO";
      } else if (valorTotalPago > 0) {
        novoStatus = "PARCIAL";
      }

      // Atualizar status da compra
      await tx.compra.update({
        where: { id: pagamento.compraId },
        data: { statusPagamento: novoStatus },
      });

      // Reverter saldo do fornecedor
      const novoSaldoFornecedor =
        Number(pagamento.compra.fornecedor.saldo) + Number(pagamento.valorPago);
      await tx.fornecedor.update({
        where: { id: pagamento.compra.fornecedorId },
        data: { saldo: novoSaldoFornecedor },
      });

      return { message: "Pagamento deletado com sucesso" };
    });
  }

  static async gerarReciboPagamento(id: string) {
    const pagamento = await PagamentoModel.findComDetalhesCompletos(id);

    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    // Buscar pagamentos anteriores para calcular sequência
    const pagamentosAnteriores = await PagamentoModel.findPagamentosAnteriores(
      pagamento.compraId,
      pagamento.createdAt
    );

    const numeroPagamento = pagamentosAnteriores.length + 1;
    const valorTotalPago =
      pagamentosAnteriores.reduce(
        (total, pag) => total + Number(pag.valorPago),
        0
      ) + Number(pagamento.valorPago);

    const valorTotalCompra = Number(pagamento.compra.valorTotal);
    const saldoRestante = valorTotalCompra - valorTotalPago;

    return {
      recibo: {
        id: pagamento.id,
        numeroPagamento,
        data: pagamento.createdAt,
        valor: Number(pagamento.valorPago),
        observacoes: "",
        compra: {
          id: pagamento.compra.id,
          valorTotal: valorTotalCompra,
          precoKg: Number(pagamento.compra.precoPorKg),
          ticket: {
            numeroTicket: pagamento.compra.ticket.id,
            pesoLiquido: Number(pagamento.compra.ticket.pesoLiquido),
          },
        },
        fornecedor: {
          nome: pagamento.compra.fornecedor.nome,
          documento: pagamento.compra.fornecedor.documento,
        },
        resumo: {
          valorTotalCompra,
          valorTotalPago,
          saldoRestante,
          percentualPago: (valorTotalPago / valorTotalCompra) * 100,
        },
      },
    };
  }

  static async obterEstatisticas(params?: {
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    const where: any = {};

    if (params?.fornecedorId) {
      where.compra = {
        fornecedorId: params.fornecedorId,
      };
    }

    if (params?.dataInicio || params?.dataFim) {
      where.createdAt = {};
      if (params.dataInicio) {
        where.createdAt.gte = new Date(params.dataInicio);
      }
      if (params.dataFim) {
        where.createdAt.lte = new Date(params.dataFim);
      }
    }

    const [totalPagamentos, estatisticasValor, pagamentosPorMes] =
      await Promise.all([
        PagamentoModel.count(where),
        PagamentoModel.aggregate({
          where,
          _sum: {
            valorPago: true,
          },
          _count: {
            valorPago: true,
          },
        }),
        prisma.pagamento.groupBy({
          by: ["createdAt"],
          where,
          _sum: {
            valorPago: true,
          },
          _count: true,
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

    // Agrupar por mês
    const pagamentosPorMesAgrupados = pagamentosPorMes.reduce(
      (acc, pagamento) => {
        const mes = pagamento.createdAt.toISOString().substring(0, 7); // YYYY-MM
        if (!acc[mes]) {
          acc[mes] = {
            mes,
            totalPagamentos: 0,
            valorTotal: 0,
          };
        }
        acc[mes].totalPagamentos += pagamento._count;
        acc[mes].valorTotal += Number(pagamento._sum?.valorPago ?? 0);
        return acc;
      },
      {} as Record<string, any>
    );

    return {
      totalPagamentos,
      valorTotalPago: Number(estatisticasValor._sum?.valorPago || 0),
      //totalPagamentos: Number(estatisticasValor._count?.valorPago || 0),
      pagamentosPorMes: Object.values(pagamentosPorMesAgrupados),
    };
  }

  static async listarPagamentosPorCompra(compraId: string) {
    // Verificar se a compra existe
    const compra = await CompraModel.findUnique({
      where: { id: compraId },
    });

    if (!compra) {
      throw new Error("Compra não encontrada");
    }

    const pagamentos = await PagamentoModel.findByCompraId(compraId);

    // Calcular informações resumidas
    const valorTotalPago = pagamentos.reduce(
      (total, pagamento) => total + Number(pagamento.valorPago),
      0
    );
    const valorTotalCompra = Number(compra.valorTotal);
    const saldoRestante = valorTotalCompra - valorTotalPago;

    return {
      compra: {
        id: compra.id,
        valorTotal: valorTotalCompra,
        statusPagamento: compra.statusPagamento,
      },
      pagamentos,
      resumo: {
        totalPagamentos: pagamentos.length,
        valorTotalPago,
        saldoRestante,
        percentualPago:
          valorTotalCompra > 0 ? (valorTotalPago / valorTotalCompra) * 100 : 0,
      },
    };
  }

  static async validarPagamento(compraId: string, valor: number) {
    const compra = await CompraModel.findUnique({
      where: { id: compraId },
      include: {
        pagamentos: true,
      },
    });

    if (!compra) {
      throw new Error("Compra não encontrada");
    }

    if (valor <= 0) {
      throw new Error("Valor do pagamento deve ser maior que zero");
    }

    const valorJaPago = (compra as any).pagamentos?.reduce(
      (total: number, pagamento: { valorPago: number }) =>
        total + Number(pagamento.valorPago),
      0
    );

    const valorTotalCompra = Number(compra.valorTotal);
    const saldoRestante = valorTotalCompra - valorJaPago;

    if (valor > saldoRestante) {
      throw new Error(
        `Valor do pagamento (R$ ${valor.toFixed(
          2
        )}) excede o saldo restante (R$ ${saldoRestante.toFixed(2)})`
      );
    }

    return {
      valorTotalCompra,
      valorJaPago,
      saldoRestante,
      valorPagamento: valor,
      novoSaldo: saldoRestante - valor,
      statusAposPaymento:
        valorJaPago + valor >= valorTotalCompra ? "PAGO" : "PARCIAL",
    };
  }
}
