import { prisma } from "../lib/prisma";

export class RelatorioService {
  // ✅ SIMPLIFICADO: Relatório de Compras
  static async relatorioCompras(params: {
    dataInicio?: string;
    dataFim?: string;
    fornecedorId?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
    page?: number;
    limit?: number;
  }) {
    const {
      dataInicio,
      dataFim,
      fornecedorId,
      statusPagamento,
      page = 1,
      limit = 50,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (statusPagamento) where.statusPagamento = statusPagamento;
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) where.createdAt.lte = new Date(dataFim);
    }

    const [compras, total, resumo] = await Promise.all([
      prisma.compra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          valorTotal: true,
          precoPorKg: true,
          statusPagamento: true,
          fornecedor: { select: { id: true, nome: true, documento: true } },
          ticket: { select: { id: true, pesoLiquido: true } },
          _count: { select: { pagamentos: true } },
        },
      }),
      prisma.compra.count({ where }),
      prisma.compra.aggregate({
        where,
        _sum: { valorTotal: true },
        _avg: { precoPorKg: true },
      }),
    ]);

    return {
      compras: compras.map((compra) => ({
        ...compra,
        valorTotal: compra.valorTotal.toNumber(),
        precoPorKg: compra.precoPorKg.toNumber(),
        totalPagamentos: compra._count.pagamentos,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      resumo: {
        totalCompras: total,
        valorTotal: Number(resumo._sum.valorTotal || 0),
        precoMedio: Number(resumo._avg.precoPorKg || 0),
      },
    };
  }

  // ✅ SIMPLIFICADO: Relatório de Fornecedores
  static async relatorioFornecedores(params: {
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
  }) {
    const { dataInicio, dataFim, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const dateFilter =
      dataInicio || dataFim
        ? {
            createdAt: {
              ...(dataInicio && { gte: new Date(dataInicio) }),
              ...(dataFim && { lte: new Date(dataFim) }),
            },
          }
        : {};

    const [fornecedores, total] = await Promise.all([
      prisma.fornecedor.findMany({
        skip,
        take: limit,
        orderBy: { nome: "asc" },
        include: {
          _count: {
            select: {
              compras: { where: dateFilter },
              tickets: { where: { ...dateFilter, status: "PENDENTE" } },
            },
          },
          compras: {
            where: dateFilter,
            select: {
              valorTotal: true,
              ticket: { select: { pesoLiquido: true } },
              _count: { select: { pagamentos: true } },
            },
          },
        },
      }),
      prisma.fornecedor.count(),
    ]);

    const fornecedoresProcessados = fornecedores.map((fornecedor) => {
      const valorTotalCompras = fornecedor.compras.reduce(
        (sum, c) => sum + c.valorTotal.toNumber(),
        0
      );
      const pesoTotal = fornecedor.compras.reduce(
        (sum, c) => sum + c.ticket.pesoLiquido.toNumber(),
        0
      );

      return {
        id: fornecedor.id,
        nome: fornecedor.nome,
        documento: fornecedor.documento,
        contato: fornecedor.contato,
        endereco: fornecedor.endereco,
        saldo: fornecedor.saldo.toNumber(),
        estatisticas: {
          totalCompras: fornecedor._count.compras,
          valorTotalCompras,
          pesoTotal,
          ticketsPendentes: fornecedor._count.tickets,
          precoMedio: pesoTotal > 0 ? valorTotalCompras / pesoTotal : 0,
        },
      };
    });

    return {
      fornecedores: fornecedoresProcessados,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ✅ SIMPLIFICADO: Dashboard
  static async dashboard(params?: { dataInicio?: string; dataFim?: string }) {
    const { dataInicio, dataFim } = params || {};

    const dateFilter =
      dataInicio || dataFim
        ? {
            createdAt: {
              ...(dataInicio && { gte: new Date(dataInicio) }),
              ...(dataFim && { lte: new Date(dataFim) }),
            },
          }
        : {};

    const [metricas, distribuicoes] = await Promise.all([
      // Métricas principais em uma única query
      prisma.$transaction([
        prisma.fornecedor.count(),
        prisma.ticket.count({ where: dateFilter }),
        prisma.compra.aggregate({
          where: dateFilter,
          _count: true,
          _sum: { valorTotal: true },
          _avg: { precoPorKg: true },
        }),
        prisma.pagamento.aggregate({
          where: dateFilter,
          _count: true,
          _sum: { valorPago: true },
        }),
      ]),

      // Distribuições
      Promise.all([
        prisma.compra.groupBy({
          by: ["statusPagamento"],
          where: dateFilter,
          _count: true,
          _sum: { valorTotal: true },
        }),
        prisma.ticket.groupBy({
          by: ["status"],
          where: dateFilter,
          _count: true,
          _sum: { pesoLiquido: true },
        }),
      ]),
    ]);

    const [totalFornecedores, totalTickets, comprasStats, pagamentosStats] =
      metricas;
    const [comprasPorStatus, ticketsPorStatus] = distribuicoes;

    return {
      metricas: {
        totalFornecedores,
        totalTickets,
        totalCompras: comprasStats._count,
        totalPagamentos: pagamentosStats._count,
        valorTotalCompras: Number(comprasStats._sum.valorTotal || 0),
        valorTotalPago: Number(pagamentosStats._sum.valorPago || 0),
        precoMedio: Number(comprasStats._avg.precoPorKg || 0),
      },
      distribuicoes: {
        comprasPorStatus: comprasPorStatus.map((item) => ({
          status: item.statusPagamento,
          quantidade: item._count,
          valor: item._sum.valorTotal?.toNumber() || 0,
        })),
        ticketsPorStatus: ticketsPorStatus.map((item) => ({
          status: item.status,
          quantidade: item._count,
          peso: item._sum.pesoLiquido?.toNumber() || 0,
        })),
      },
    };
  }

  // ✅ SIMPLIFICADO: Fluxo de Caixa
  static async relatorioFluxoCaixa(params: {
    dataInicio?: string;
    dataFim?: string;
    fornecedorId?: string;
  }) {
    const { dataInicio, dataFim, fornecedorId } = params;

    const dateFilter =
      dataInicio || dataFim
        ? {
            createdAt: {
              ...(dataInicio && { gte: new Date(dataInicio) }),
              ...(dataFim && { lte: new Date(dataFim) }),
            },
          }
        : {};

    const whereCompras = {
      ...dateFilter,
      ...(fornecedorId && { fornecedorId }),
    };
    const wherePagamentos = {
      ...dateFilter,
      ...(fornecedorId && { compra: { fornecedorId } }),
    };

    const [compras, pagamentos] = await Promise.all([
      prisma.compra.findMany({
        where: whereCompras,
        select: {
          id: true,
          createdAt: true,
          valorTotal: true,
          fornecedor: { select: { nome: true } },
          ticket: { select: { id: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.pagamento.findMany({
        where: wherePagamentos,
        select: {
          id: true,
          createdAt: true,
          valorPago: true,
          compra: {
            select: {
              fornecedor: { select: { nome: true } },
              ticket: { select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const eventos = [
      ...compras.map((c) => ({
        data: c.createdAt,
        tipo: "COMPRA" as const,
        valor: Number(c.valorTotal),
        descricao: `Compra - Ticket ${c.ticket.id}`,
        fornecedor: c.fornecedor.nome,
      })),
      ...pagamentos.map((p) => ({
        data: p.createdAt,
        tipo: "PAGAMENTO" as const,
        valor: p.valorPago.toNumber(),
        descricao: `Pagamento - Ticket ${p.compra.ticket.id}`,
        fornecedor: p.compra.fornecedor.nome,
      })),
    ].sort((a, b) => a.data.getTime() - b.data.getTime());

    let saldoAcumulado = 0;
    const fluxo = eventos.map((evento) => {
      saldoAcumulado += evento.tipo === "COMPRA" ? evento.valor : -evento.valor;
      return { ...evento, saldoAcumulado };
    });

    const totalCompras = compras.reduce(
      (sum, c) => sum + c.valorTotal.toNumber(),
      0
    );
    const totalPagamentos = pagamentos.reduce(
      (sum, p) => sum + p.valorPago.toNumber(),
      0
    );

    return {
      fluxo,
      resumo: {
        totalCompras: compras.length,
        totalPagamentos: pagamentos.length,
        valorTotalCompras: totalCompras,
        valorTotalPagamentos: totalPagamentos,
        saldoFinal: totalCompras - totalPagamentos,
      },
    };
  }
}
