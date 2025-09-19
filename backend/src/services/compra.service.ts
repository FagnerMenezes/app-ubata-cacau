import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase";
import { CustomError } from "../middleware/error.middleware";
import { CreateCompraInput } from "../types";

export class CompraService {
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

    try {
      // Construir query base
      let query = supabase.from("compras").select(
        `
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          ),
          ticket:tickets(
            id,
            pesoLiquido,
            pesoBruto
          ),
          pagamentos(
            id,
            valorPago
          )
        `,
        { count: "exact" }
      );

      // Aplicar filtros
      if (fornecedorId) {
        query = query.eq("fornecedorId", fornecedorId);
      }

      if (statusPagamento) {
        query = query.eq("statusPagamento", statusPagamento);
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

      const { data: compras, error, count } = await query;

      if (error) {
        console.error("Erro ao listar compras:", error);
        throw new CustomError("Erro ao listar compras", 500);
      }

      return {
        compras: compras || [],
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
      throw new CustomError("Erro ao listar compras", 500);
    }
  }

  static async buscarPorId(id: string) {
    try {
      const { data: compra, error } = await supabase
        .from("compras")
        .select(
          `
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          ),
          ticket:tickets(
            id,
            pesoLiquido,
            pesoBruto
          ),
          pagamentos(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new CustomError("Compra não encontrada", 404);
        }
        console.error("Erro ao buscar compra:", error);
        throw new CustomError("Erro ao buscar compra", 500);
      }

      if (!compra) {
        throw new CustomError("Compra não encontrada", 404);
      }

      return compra;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao buscar compra", 500);
    }
  }

  static async converterTicket(data: CreateCompraInput) {
    try {
      // Verificar se o ticket existe e não foi convertido
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(
          `
          *,
          compra:compras(*),
          fornecedor:fornecedores(*)
        `
        )
        .eq("id", data.ticketId)
        .single();

      if (ticketError) {
        if (ticketError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        console.error("Erro ao buscar ticket:", ticketError);
        throw new CustomError("Erro ao buscar ticket", 500);
      }

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

      const now = new Date().toISOString();

      // Criar a compra
      const compraData = {
        id: uuidv4(),
        ticketId: data.ticketId,
        fornecedorId: ticket.fornecedorId,
        precoPorArroba: data.precoPorArroba,
        precoPorKg: precoPorKg,
        valorTotal,
        statusPagamento: "PENDENTE",
        observacoes: data.observacoes,
        createdAt: now,
        updatedAt: now,
      };

      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .insert([compraData])
        .select(
          `
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          ),
          ticket:tickets(
            id,
            pesoLiquido,
            pesoBruto,
            status
          )
        `
        )
        .single();

      if (compraError) {
        console.error("Erro ao criar compra:", compraError);
        throw new CustomError("Erro ao criar compra", 500);
      }

      // Atualizar status do ticket para CONVERTIDO
      const { error: updateTicketError } = await supabase
        .from("tickets")
        .update({
          status: "CONVERTIDO",
          updatedAt: now,
        })
        .eq("id", data.ticketId);

      if (updateTicketError) {
        console.error("Erro ao atualizar ticket:", updateTicketError);
        // Tentar reverter a criação da compra
        await supabase.from("compras").delete().eq("id", compra.id);
        throw new CustomError("Erro ao atualizar ticket", 500);
      }

      return compra;
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
      const { data: compraExistente, error: compraError } = await supabase
        .from("compras")
        .select(
          `
          *,
          ticket:tickets(*),
          pagamentos(*)
        `
        )
        .eq("id", id)
        .single();

      if (compraError) {
        if (compraError.code === "PGRST116") {
          throw new CustomError("Compra não encontrada", 404);
        }
        console.error("Erro ao buscar compra:", compraError);
        throw new CustomError("Erro ao buscar compra", 500);
      }

      if (!compraExistente) {
        throw new CustomError("Compra não encontrada", 404);
      }

      // Verificar se há pagamentos - permitir apenas edição de observações
      const temPagamentos =
        compraExistente.pagamentos && compraExistente.pagamentos.length > 0;

      if (temPagamentos) {
        // Se tem pagamentos, só permitir edição de observações
        const camposProibidos = Object.keys(data).filter(
          (key) => key !== "observacoes"
        );
        if (camposProibidos.length > 0) {
          throw new CustomError(
            "Compra com pagamentos só permite edição do campo observações",
            400
          );
        }
      }

      let updateData: any = {
        updatedAt: new Date().toISOString(),
      };

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
        if (
          data.precoPorArroba &&
          data.precoPorArroba !== Number(compraExistente.precoPorArroba)
        ) {
          const pesoLiquido = Number(compraExistente.ticket.pesoLiquido);
          const precoPorKg = data.precoPorArroba / 15;
          updateData.precoPorArroba = data.precoPorArroba;
          updateData.precoPorKg = precoPorKg;
          updateData.valorTotal = pesoLiquido * precoPorKg;
        }
      }

      // Atualizar a compra
      const { data: compraAtualizada, error: updateError } = await supabase
        .from("compras")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          ),
          ticket:tickets(
            id,
            pesoLiquido,
            pesoBruto,
            status
          ),
          pagamentos(*)
        `
        )
        .single();

      if (updateError) {
        console.error("Erro ao atualizar compra:", updateError);
        throw new CustomError("Erro ao atualizar compra", 500);
      }

      return compraAtualizada;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar compra", 500);
    }
  }

  static async deletar(id: string) {
    try {
      // Verificar se a compra existe
      const { data: compra, error: compraError } = await supabase
        .from("compras")
        .select(
          `
          *,
          ticket:tickets(*),
          pagamentos(*)
        `
        )
        .eq("id", id)
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

      // Verificar se há pagamentos associados
      if (compra.pagamentos && compra.pagamentos.length > 0) {
        throw new CustomError(
          "Não é possível deletar compra com pagamentos associados",
          409
        );
      }

      // Deletar a compra
      const { error: deleteError } = await supabase
        .from("compras")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Erro ao deletar compra:", deleteError);
        throw new CustomError("Erro ao deletar compra", 500);
      }

      // Reverter o status do ticket para PENDENTE
      const { error: updateTicketError } = await supabase
        .from("tickets")
        .update({
          status: "PENDENTE",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", compra.ticketId);

      if (updateTicketError) {
        console.error("Erro ao atualizar ticket:", updateTicketError);
        // Não falhar aqui, pois a compra já foi deletada
      }

      return { message: "Compra deletada com sucesso" };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar compra", 500);
    }
  }

  static async obterEstatisticas(periodo?: string) {
    try {
      let dataInicio: string | undefined;

      // Filtrar por período se especificado
      if (periodo) {
        const agora = new Date();

        switch (periodo) {
          case "mes":
            dataInicio = new Date(
              agora.getFullYear(),
              agora.getMonth(),
              1
            ).toISOString();
            break;
          case "trimestre":
            dataInicio = new Date(
              agora.getFullYear(),
              agora.getMonth() - 3,
              1
            ).toISOString();
            break;
          case "ano":
            dataInicio = new Date(agora.getFullYear(), 0, 1).toISOString();
            break;
          default:
            dataInicio = new Date(
              agora.getFullYear(),
              agora.getMonth(),
              1
            ).toISOString();
        }
      }

      // Buscar todas as compras do período
      let query = supabase
        .from("compras")
        .select("valorTotal, statusPagamento");

      if (dataInicio) {
        query = query.gte("createdAt", dataInicio);
      }

      const { data: compras, error } = await query;

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw new CustomError("Erro ao obter estatísticas", 500);
      }

      const totalCompras = compras?.length || 0;
      const valorTotal =
        compras?.reduce((sum, compra) => sum + Number(compra.valorTotal), 0) ||
        0;
      const comprasPendentes =
        compras?.filter((c) => c.statusPagamento === "PENDENTE").length || 0;
      const comprasPagas =
        compras?.filter((c) => c.statusPagamento === "PAGO").length || 0;

      return {
        totalCompras,
        valorTotal,
        comprasPendentes,
        comprasPagas,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter estatísticas", 500);
    }
  }
}
