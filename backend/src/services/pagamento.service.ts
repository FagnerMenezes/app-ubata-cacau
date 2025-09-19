import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase";
import { CustomError } from "../middleware/error.middleware";
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

    try {
      // Construir query base
      let query = supabase.from("pagamentos").select(
        `
          *,
          compra:compras(
            *,
            fornecedor:fornecedores(
              id,
              nome,
              documento
            ),
            ticket:tickets(
              id,
              status
            )
          )
        `,
        { count: "exact" }
      );

      // Aplicar filtros
      if (compraId) {
        query = query.eq("compraId", compraId);
      }

      if (fornecedorId) {
        query = query.eq("compra.fornecedorId", fornecedorId);
      }

      if (dataInicio) {
        query = query.gte("createdAt", dataInicio);
      }

      if (dataFim) {
        query = query.lte("createdAt", dataFim);
      }

      // Aplicar paginação e ordenação
      query = query
        .order("createdAt", { ascending: false })
        .range(skip, skip + limit - 1);

      const { data: pagamentos, error, count } = await query;

      if (error) {
        console.error("Erro ao listar pagamentos:", error);
        throw new CustomError("Erro ao listar pagamentos", 500);
      }

      return {
        pagamentos: pagamentos || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao listar pagamentos", 500);
    }
  }

  static async buscarPagamentoPorId(id: string) {
    try {
      const { data: pagamento, error } = await supabase
        .from("pagamentos")
        .select(
          `
          *,
          compra:compras(
            *,
            fornecedor:fornecedores(*),
            ticket:tickets(*),
            pagamentos(*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new CustomError("Pagamento não encontrado", 404);
        }
        console.error("Erro ao buscar pagamento:", error);
        throw new CustomError("Erro ao buscar pagamento", 500);
      }

      if (!pagamento) {
        throw new CustomError("Pagamento não encontrado", 404);
      }

      // Calcular informações adicionais
      const valorTotalCompra = Number(pagamento.compra.valorTotal);
      const valorTotalPago =
        pagamento.compra.pagamentos?.reduce(
          (total: number, pag: any) => total + Number(pag?.valorPago || 0),
          0
        ) || 0;
      const saldoRestante = valorTotalCompra - valorTotalPago;

      return {
        ...pagamento,
        compra: {
          ...pagamento.compra,
          valorTotalPago,
          saldoRestante,
        },
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao buscar pagamento", 500);
    }
  }

  static async criarPagamento(data: CreatePagamentoInput) {
    try {
      // Verificar se a compra existe
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .select(
          `
          *,
          pagamentos(*),
          fornecedor:fornecedores(*)
        `
        )
        .eq("id", data.compraId)
        .single();

      if (compraError) {
        if (compraError.code === "PGRST116") {
          throw new CustomError("Compra não encontrada", 404);
        }
        console.error("Erro ao buscar compra:", compraError);
        throw new CustomError("Erro ao buscar compra", 500);
      }

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
      const valorJaPago =
        compra.pagamentos?.reduce(
          (total: number, pagamento: any) =>
            total + Number(pagamento.valorPago),
          0
        ) || 0;

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

      const now = new Date().toISOString();

      // Criar o pagamento
      const pagamentoData = {
        id: uuidv4(),
        compraId: data.compraId,
        valorPago: data.valorPago,
        metodoPagamento: data.metodoPagamento,
        observacoes: data.observacoes,
        createdAt: now,
        updatedAt: now,
      };

      const { data: pagamento, error: pagamentoError } = await supabase
        .from("pagamentos")
        .insert([pagamentoData])
        .select(
          `
          *,
          compra:compras(
            *,
            fornecedor:fornecedores(*),
            ticket:tickets(*)
          )
        `
        )
        .single();

      if (pagamentoError) {
        console.error("Erro ao criar pagamento:", pagamentoError);
        throw new CustomError("Erro ao criar pagamento", 500);
      }

      // Calcular novo status da compra
      const novoValorPago = valorJaPago + data.valorPago;
      let novoStatus: "PENDENTE" | "PARCIAL" | "PAGO" = "PENDENTE";

      if (novoValorPago >= valorTotalCompra) {
        novoStatus = "PAGO";
      } else if (novoValorPago > 0) {
        novoStatus = "PARCIAL";
      }

      // Atualizar status da compra
      const { error: updateCompraError } = await supabase
        .from("compras")
        .update({
          statusPagamento: novoStatus,
          updatedAt: now,
        })
        .eq("id", data.compraId);

      if (updateCompraError) {
        console.error("Erro ao atualizar compra:", updateCompraError);
        // Tentar reverter a criação do pagamento
        await supabase.from("pagamentos").delete().eq("id", pagamento.id);
        throw new CustomError("Erro ao atualizar compra", 500);
      }

      // Atualizar saldo do fornecedor
      const novoSaldoFornecedor =
        Number(compra.fornecedor.saldo) - data.valorPago;
      const { error: updateFornecedorError } = await supabase
        .from("fornecedores")
        .update({
          saldo: novoSaldoFornecedor,
          updatedAt: now,
        })
        .eq("id", compra.fornecedorId);

      if (updateFornecedorError) {
        console.error("Erro ao atualizar fornecedor:", updateFornecedorError);
        // Não falhar aqui, pois o pagamento e compra já foram atualizados
      }

      return pagamento;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar pagamento", 500);
    }
  }

  static async deletarPagamento(id: string) {
    try {
      // Buscar o pagamento
      const { data: pagamento, error: pagamentoError } = await supabase
        .from("pagamentos")
        .select(
          `
          *,
          compra:compras(
            *,
            fornecedor:fornecedores(*),
            pagamentos(*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (pagamentoError) {
        if (pagamentoError.code === "PGRST116") {
          throw new CustomError("Pagamento não encontrado", 404);
        }
        console.error("Erro ao buscar pagamento:", pagamentoError);
        throw new CustomError("Erro ao buscar pagamento", 500);
      }

      if (!pagamento) {
        throw new CustomError("Pagamento não encontrado", 404);
      }

      // Verificar se é o último pagamento (para evitar problemas de ordem)
      const { data: ultimoPagamento, error: ultimoError } = await supabase
        .from("pagamentos")
        .select("id")
        .eq("compraId", pagamento.compraId)
        .order("createdAt", { ascending: false })
        .limit(1)
        .single();

      if (ultimoError && ultimoError.code !== "PGRST116") {
        console.error("Erro ao buscar último pagamento:", ultimoError);
        throw new CustomError("Erro ao buscar último pagamento", 500);
      }

      if (ultimoPagamento?.id !== id) {
        throw new CustomError(
          "Apenas o último pagamento pode ser deletado",
          400
        );
      }

      // Deletar o pagamento
      const { error: deleteError } = await supabase
        .from("pagamentos")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Erro ao deletar pagamento:", deleteError);
        throw new CustomError("Erro ao deletar pagamento", 500);
      }

      // Recalcular status da compra
      const pagamentosRestantes =
        pagamento.compra.pagamentos?.filter((p: any) => p.id !== id) || [];
      const valorTotalPago = pagamentosRestantes.reduce(
        (total: number, pag: any) => total + Number(pag.valorPago),
        0
      );

      const valorTotalCompra = Number(pagamento.compra.valorTotal);
      let novoStatus: "PENDENTE" | "PARCIAL" | "PAGO" = "PENDENTE";

      if (valorTotalPago >= valorTotalCompra) {
        novoStatus = "PAGO";
      } else if (valorTotalPago > 0) {
        novoStatus = "PARCIAL";
      }

      const now = new Date().toISOString();

      // Atualizar status da compra
      const { error: updateCompraError } = await supabase
        .from("compras")
        .update({
          statusPagamento: novoStatus,
          updatedAt: now,
        })
        .eq("id", pagamento.compraId);

      if (updateCompraError) {
        console.error("Erro ao atualizar compra:", updateCompraError);
        // Não falhar aqui, pois o pagamento já foi deletado
      }

      // Reverter saldo do fornecedor
      const novoSaldoFornecedor =
        Number(pagamento.compra.fornecedor.saldo) + Number(pagamento.valorPago);
      const { error: updateFornecedorError } = await supabase
        .from("fornecedores")
        .update({
          saldo: novoSaldoFornecedor,
          updatedAt: now,
        })
        .eq("id", pagamento.compra.fornecedorId);

      if (updateFornecedorError) {
        console.error("Erro ao atualizar fornecedor:", updateFornecedorError);
        // Não falhar aqui, pois o pagamento já foi deletado
      }

      return { message: "Pagamento deletado com sucesso" };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar pagamento", 500);
    }
  }

  static async gerarReciboPagamento(id: string) {
    try {
      const { data: pagamento, error } = await supabase
        .from("pagamentos")
        .select(
          `
          *,
          compra:compras(
            *,
            fornecedor:fornecedores(*),
            ticket:tickets(*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new CustomError("Pagamento não encontrado", 404);
        }
        console.error("Erro ao buscar pagamento:", error);
        throw new CustomError("Erro ao buscar pagamento", 500);
      }

      if (!pagamento) {
        throw new CustomError("Pagamento não encontrado", 404);
      }

      // Buscar pagamentos anteriores para calcular sequência
      const { data: pagamentosAnteriores, error: anterioresError } =
        await supabase
          .from("pagamentos")
          .select("*")
          .eq("compraId", pagamento.compraId)
          .lt("createdAt", pagamento.createdAt)
          .order("createdAt", { ascending: true });

      if (anterioresError) {
        console.error("Erro ao buscar pagamentos anteriores:", anterioresError);
        throw new CustomError("Erro ao buscar pagamentos anteriores", 500);
      }

      const numeroPagamento = (pagamentosAnteriores?.length || 0) + 1;
      const valorTotalPago =
        (pagamentosAnteriores?.reduce(
          (total, pag) => total + Number(pag.valorPago),
          0
        ) || 0) + Number(pagamento.valorPago);

      const valorTotalCompra = Number(pagamento.compra.valorTotal);
      const saldoRestante = valorTotalCompra - valorTotalPago;

      return {
        recibo: {
          id: pagamento.id,
          numeroPagamento,
          data: pagamento.createdAt,
          valor: Number(pagamento.valorPago),
          observacoes: pagamento.observacoes || "",
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
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao gerar recibo", 500);
    }
  }

  static async obterEstatisticas(params?: {
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    try {
      // Construir query base
      let query = supabase
        .from("pagamentos")
        .select("valorPago, createdAt, compra:compras(fornecedorId)");

      // Aplicar filtros
      if (params?.fornecedorId) {
        query = query.eq("compra.fornecedorId", params.fornecedorId);
      }

      if (params?.dataInicio) {
        query = query.gte("createdAt", params.dataInicio);
      }

      if (params?.dataFim) {
        query = query.lte("createdAt", params.dataFim);
      }

      const { data: pagamentos, error } = await query;

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw new CustomError("Erro ao obter estatísticas", 500);
      }

      const totalPagamentos = pagamentos?.length || 0;
      const valorTotalPago =
        pagamentos?.reduce((total, pag) => total + Number(pag.valorPago), 0) ||
        0;

      // Agrupar por mês
      const pagamentosPorMesAgrupados =
        pagamentos?.reduce((acc, pagamento) => {
          const mes = pagamento.createdAt.substring(0, 7); // YYYY-MM
          if (!acc[mes]) {
            acc[mes] = {
              mes,
              totalPagamentos: 0,
              valorTotal: 0,
            };
          }
          acc[mes].totalPagamentos += 1;
          acc[mes].valorTotal += Number(pagamento.valorPago);
          return acc;
        }, {} as Record<string, any>) || {};

      return {
        totalPagamentos,
        valorTotalPago,
        pagamentosPorMes: Object.values(pagamentosPorMesAgrupados),
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter estatísticas", 500);
    }
  }

  static async listarPagamentosPorCompra(compraId: string) {
    try {
      // Verificar se a compra existe
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .select("*")
        .eq("id", compraId)
        .single();

      if (compraError) {
        if (compraError.code === "PGRST116") {
          throw new CustomError("Compra não encontrada", 404);
        }
        console.error("Erro ao buscar compra:", compraError);
        throw new CustomError("Erro ao buscar compra", 500);
      }

      if (!compra) {
        throw new CustomError("Compra não encontrada", 404);
      }

      const { data: pagamentos, error: pagamentosError } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("compraId", compraId)
        .order("createdAt", { ascending: true });

      if (pagamentosError) {
        console.error("Erro ao buscar pagamentos:", pagamentosError);
        throw new CustomError("Erro ao buscar pagamentos", 500);
      }

      // Calcular informações resumidas
      const valorTotalPago = (pagamentos || []).reduce(
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
        pagamentos: pagamentos || [],
        resumo: {
          totalPagamentos: (pagamentos || []).length,
          valorTotalPago,
          saldoRestante,
          percentualPago:
            valorTotalCompra > 0
              ? (valorTotalPago / valorTotalCompra) * 100
              : 0,
        },
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao listar pagamentos por compra", 500);
    }
  }

  static async validarPagamento(compraId: string, valor: number) {
    try {
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .select(
          `
          *,
          pagamentos(*)
        `
        )
        .eq("id", compraId)
        .single();

      if (compraError) {
        if (compraError.code === "PGRST116") {
          throw new CustomError("Compra não encontrada", 404);
        }
        console.error("Erro ao buscar compra:", compraError);
        throw new CustomError("Erro ao buscar compra", 500);
      }

      if (!compra) {
        throw new CustomError("Compra não encontrada", 404);
      }

      if (valor <= 0) {
        throw new CustomError(
          "Valor do pagamento deve ser maior que zero",
          400
        );
      }

      const valorJaPago =
        compra.pagamentos?.reduce(
          (total: number, pagamento: any) =>
            total + Number(pagamento.valorPago),
          0
        ) || 0;

      const valorTotalCompra = Number(compra.valorTotal);
      const saldoRestante = valorTotalCompra - valorJaPago;

      if (valor > saldoRestante) {
        throw new CustomError(
          `Valor do pagamento (R$ ${valor.toFixed(
            2
          )}) excede o saldo restante (R$ ${saldoRestante.toFixed(2)})`,
          400
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
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao validar pagamento", 500);
    }
  }
}
