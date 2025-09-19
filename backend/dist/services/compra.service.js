"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompraService = void 0;
const uuid_1 = require("uuid");
const supabase_1 = __importDefault(require("../lib/supabase"));
const error_middleware_1 = require("../middleware/error.middleware");
class CompraService {
    static async listarCompras(params) {
        const { page = 1, limit = 10, fornecedorId, statusPagamento, dataInicio, dataFim, } = params;
        const skip = (page - 1) * limit;
        try {
            let query = supabase_1.default.from("compras").select(`
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
        `, { count: "exact" });
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
            query = query
                .order("createdAt", { ascending: false })
                .range(skip, skip + limit - 1);
            const { data: compras, error, count } = await query;
            if (error) {
                console.error("Erro ao listar compras:", error);
                throw new error_middleware_1.CustomError("Erro ao listar compras", 500);
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao listar compras", 500);
        }
    }
    static async buscarPorId(id) {
        try {
            const { data: compra, error } = await supabase_1.default
                .from("compras")
                .select(`
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
        `)
                .eq("id", id)
                .single();
            if (error) {
                if (error.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Compra não encontrada", 404);
                }
                console.error("Erro ao buscar compra:", error);
                throw new error_middleware_1.CustomError("Erro ao buscar compra", 500);
            }
            if (!compra) {
                throw new error_middleware_1.CustomError("Compra não encontrada", 404);
            }
            return compra;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao buscar compra", 500);
        }
    }
    static async converterTicket(data) {
        try {
            const { data: ticket, error: ticketError } = await supabase_1.default
                .from("tickets")
                .select(`
          *,
          compra:compras(*),
          fornecedor:fornecedores(*)
        `)
                .eq("id", data.ticketId)
                .single();
            if (ticketError) {
                if (ticketError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                console.error("Erro ao buscar ticket:", ticketError);
                throw new error_middleware_1.CustomError("Erro ao buscar ticket", 500);
            }
            if (!ticket) {
                throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
            }
            if (ticket.compra) {
                throw new error_middleware_1.CustomError("Ticket já foi convertido em compra", 400);
            }
            const pesoLiquido = Number(ticket.pesoLiquido);
            const precoPorKg = data.precoPorArroba / 15;
            const valorTotal = pesoLiquido * precoPorKg;
            const now = new Date().toISOString();
            const compraData = {
                id: (0, uuid_1.v4)(),
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
            const { data: compra, error: compraError } = await supabase_1.default
                .from("compras")
                .insert([compraData])
                .select(`
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
        `)
                .single();
            if (compraError) {
                console.error("Erro ao criar compra:", compraError);
                throw new error_middleware_1.CustomError("Erro ao criar compra", 500);
            }
            const { error: updateTicketError } = await supabase_1.default
                .from("tickets")
                .update({
                status: "CONVERTIDO",
                updatedAt: now,
            })
                .eq("id", data.ticketId);
            if (updateTicketError) {
                console.error("Erro ao atualizar ticket:", updateTicketError);
                await supabase_1.default.from("compras").delete().eq("id", compra.id);
                throw new error_middleware_1.CustomError("Erro ao atualizar ticket", 500);
            }
            return compra;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao converter ticket em compra", 500);
        }
    }
    static async atualizar(id, data) {
        try {
            const { data: compraExistente, error: compraError } = await supabase_1.default
                .from("compras")
                .select(`
          *,
          ticket:tickets(*),
          pagamentos(*)
        `)
                .eq("id", id)
                .single();
            if (compraError) {
                if (compraError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Compra não encontrada", 404);
                }
                console.error("Erro ao buscar compra:", compraError);
                throw new error_middleware_1.CustomError("Erro ao buscar compra", 500);
            }
            if (!compraExistente) {
                throw new error_middleware_1.CustomError("Compra não encontrada", 404);
            }
            const temPagamentos = compraExistente.pagamentos && compraExistente.pagamentos.length > 0;
            if (temPagamentos) {
                const camposProibidos = Object.keys(data).filter((key) => key !== "observacoes");
                if (camposProibidos.length > 0) {
                    throw new error_middleware_1.CustomError("Compra com pagamentos só permite edição do campo observações", 400);
                }
            }
            let updateData = {
                updatedAt: new Date().toISOString(),
            };
            if (temPagamentos) {
                if (data.observacoes !== undefined) {
                    updateData.observacoes = data.observacoes;
                }
            }
            else {
                if (data.observacoes !== undefined) {
                    updateData.observacoes = data.observacoes;
                }
                if (data.precoPorArroba &&
                    data.precoPorArroba !== Number(compraExistente.precoPorArroba)) {
                    const pesoLiquido = Number(compraExistente.ticket.pesoLiquido);
                    const precoPorKg = data.precoPorArroba / 15;
                    updateData.precoPorArroba = data.precoPorArroba;
                    updateData.precoPorKg = precoPorKg;
                    updateData.valorTotal = pesoLiquido * precoPorKg;
                }
            }
            const { data: compraAtualizada, error: updateError } = await supabase_1.default
                .from("compras")
                .update(updateData)
                .eq("id", id)
                .select(`
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
        `)
                .single();
            if (updateError) {
                console.error("Erro ao atualizar compra:", updateError);
                throw new error_middleware_1.CustomError("Erro ao atualizar compra", 500);
            }
            return compraAtualizada;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao atualizar compra", 500);
        }
    }
    static async deletar(id) {
        try {
            const { data: compra, error: compraError } = await supabase_1.default
                .from("compras")
                .select(`
          *,
          ticket:tickets(*),
          pagamentos(*)
        `)
                .eq("id", id)
                .single();
            if (compraError) {
                if (compraError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Compra não encontrada", 404);
                }
                console.error("Erro ao buscar compra:", compraError);
                throw new error_middleware_1.CustomError("Erro ao buscar compra", 500);
            }
            if (!compra) {
                throw new error_middleware_1.CustomError("Compra não encontrada", 404);
            }
            if (compra.pagamentos && compra.pagamentos.length > 0) {
                throw new error_middleware_1.CustomError("Não é possível deletar compra com pagamentos associados", 409);
            }
            const { error: deleteError } = await supabase_1.default
                .from("compras")
                .delete()
                .eq("id", id);
            if (deleteError) {
                console.error("Erro ao deletar compra:", deleteError);
                throw new error_middleware_1.CustomError("Erro ao deletar compra", 500);
            }
            const { error: updateTicketError } = await supabase_1.default
                .from("tickets")
                .update({
                status: "PENDENTE",
                updatedAt: new Date().toISOString(),
            })
                .eq("id", compra.ticketId);
            if (updateTicketError) {
                console.error("Erro ao atualizar ticket:", updateTicketError);
            }
            return { message: "Compra deletada com sucesso" };
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao deletar compra", 500);
        }
    }
    static async obterEstatisticas(periodo) {
        try {
            let dataInicio;
            if (periodo) {
                const agora = new Date();
                switch (periodo) {
                    case "mes":
                        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
                        break;
                    case "trimestre":
                        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 3, 1).toISOString();
                        break;
                    case "ano":
                        dataInicio = new Date(agora.getFullYear(), 0, 1).toISOString();
                        break;
                    default:
                        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
                }
            }
            let query = supabase_1.default
                .from("compras")
                .select("valorTotal, statusPagamento");
            if (dataInicio) {
                query = query.gte("createdAt", dataInicio);
            }
            const { data: compras, error } = await query;
            if (error) {
                console.error("Erro ao buscar estatísticas:", error);
                throw new error_middleware_1.CustomError("Erro ao obter estatísticas", 500);
            }
            const totalCompras = compras?.length || 0;
            const valorTotal = compras?.reduce((sum, compra) => sum + Number(compra.valorTotal), 0) ||
                0;
            const comprasPendentes = compras?.filter((c) => c.statusPagamento === "PENDENTE").length || 0;
            const comprasPagas = compras?.filter((c) => c.statusPagamento === "PAGO").length || 0;
            return {
                totalCompras,
                valorTotal,
                comprasPendentes,
                comprasPagas,
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw new error_middleware_1.CustomError("Erro ao obter estatísticas", 500);
        }
    }
}
exports.CompraService = CompraService;
//# sourceMappingURL=compra.service.js.map