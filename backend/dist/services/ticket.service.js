"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const uuid_1 = require("uuid");
const supabase_1 = __importDefault(require("../lib/supabase"));
const error_middleware_1 = require("../middleware/error.middleware");
class TicketService {
    static async create(data) {
        const { data: fornecedor, error: fornecedorError } = await supabase_1.default
            .from("fornecedores")
            .select("*")
            .eq("id", data.fornecedorId)
            .single();
        if (fornecedorError) {
            if (fornecedorError.code === "PGRST116") {
                throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
            }
            throw new error_middleware_1.CustomError("Erro ao buscar fornecedor", 500);
        }
        if (!fornecedor) {
            throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
        }
        if (data.pesoLiquido > data.pesoBruto) {
            throw new error_middleware_1.CustomError("Peso líquido não pode ser maior que peso bruto", 400);
        }
        const now = new Date().toISOString();
        const ticketData = {
            id: (0, uuid_1.v4)(),
            createdAt: now,
            updatedAt: now,
            ...data,
        };
        const { data: ticket, error: createError } = await supabase_1.default
            .from("tickets")
            .insert([ticketData])
            .select(`
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        )
      `)
            .single();
        if (createError) {
            throw new error_middleware_1.CustomError("Erro ao criar ticket", 500);
        }
        return ticket;
    }
    static async findAll(query) {
        const { page, limit, fornecedorId, status, dataInicio, dataFim } = query;
        const skip = (page - 1) * limit;
        const take = limit;
        let queryBuilder = supabase_1.default
            .from("tickets")
            .select(`
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        ),
        compra:compras(
          id,
          valorTotal,
          precoPorKg,
          statusPagamento
        )
      `)
            .order("createdAt", { ascending: false })
            .range(skip, skip + take - 1);
        if (fornecedorId) {
            queryBuilder = queryBuilder.eq("fornecedorId", fornecedorId);
        }
        if (status) {
            queryBuilder = queryBuilder.eq("status", status);
        }
        if (dataInicio) {
            queryBuilder = queryBuilder.gte("createdAt", dataInicio);
        }
        if (dataFim) {
            queryBuilder = queryBuilder.lte("createdAt", dataFim);
        }
        const { data: tickets, error: ticketsError } = await queryBuilder;
        if (ticketsError) {
            throw new error_middleware_1.CustomError("Erro ao buscar tickets", 500);
        }
        let countQuery = supabase_1.default
            .from("tickets")
            .select("*", { count: "exact", head: true });
        if (fornecedorId) {
            countQuery = countQuery.eq("fornecedorId", fornecedorId);
        }
        if (status) {
            countQuery = countQuery.eq("status", status);
        }
        if (dataInicio) {
            countQuery = countQuery.gte("createdAt", dataInicio);
        }
        if (dataFim) {
            countQuery = countQuery.lte("createdAt", dataFim);
        }
        const { count: total, error: countError } = await countQuery;
        if (countError) {
            throw new error_middleware_1.CustomError("Erro ao contar tickets", 500);
        }
        return {
            data: tickets || [],
            pagination: {
                page,
                limit,
                total: total || 0,
                totalPages: Math.ceil((total || 0) / limit),
            },
        };
    }
    static async findAvailable() {
        const { data: tickets, error: ticketsError } = await supabase_1.default
            .from("tickets")
            .select(`
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        ),
        compras(id)
      `)
            .eq("status", "PENDENTE")
            .order("createdAt", { ascending: false });
        if (ticketsError) {
            console.error("Erro na query findAvailable:", ticketsError);
            throw new error_middleware_1.CustomError("Erro ao buscar tickets disponíveis", 500);
        }
        const availableTickets = tickets?.filter(ticket => {
            return !ticket.compras || ticket.compras.length === 0;
        }) || [];
        return availableTickets;
    }
    static async findById(id) {
        const { data: ticket, error: ticketError } = await supabase_1.default
            .from("tickets")
            .select(`
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        ),
        compra:compras(
          *,
          pagamentos(
            *
          )
        )
      `)
            .eq("id", id)
            .single();
        if (ticketError) {
            if (ticketError.code === "PGRST116") {
                throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
            }
            throw new error_middleware_1.CustomError("Erro ao buscar ticket", 500);
        }
        if (!ticket) {
            throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
        }
        return ticket;
    }
    static async update(id, data) {
        try {
            const { data: ticketExistente, error: findError } = await supabase_1.default
                .from("tickets")
                .select(`
          *,
          compra:compras(id)
        `)
                .eq("id", id)
                .single();
            if (findError) {
                if (findError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                throw new error_middleware_1.CustomError("Erro ao buscar ticket", 500);
            }
            if (!ticketExistente) {
                throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
            }
            if (ticketExistente.compra) {
                throw new error_middleware_1.CustomError("Não é possível editar ticket já convertido em compra", 400);
            }
            if (!data || Object.keys(data).length === 0) {
                throw new error_middleware_1.CustomError("Nenhum dado fornecido para atualização", 400);
            }
            const pesoBruto = data.pesoBruto ?? parseFloat(ticketExistente.pesoBruto);
            const pesoLiquido = data.pesoLiquido ?? parseFloat(ticketExistente.pesoLiquido);
            if (pesoLiquido > pesoBruto) {
                throw new error_middleware_1.CustomError("Peso líquido não pode ser maior que peso bruto", 400);
            }
            const updateData = this.removeUndefinedProperties(data);
            if (Object.keys(updateData).length === 0) {
                throw new error_middleware_1.CustomError("Nenhum dado válido fornecido para atualização", 400);
            }
            const updateDataWithTimestamp = {
                ...updateData,
                updatedAt: new Date().toISOString(),
            };
            const { data: ticket, error: updateError } = await supabase_1.default
                .from("tickets")
                .update(updateDataWithTimestamp)
                .eq("id", id)
                .select(`
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          )
        `)
                .single();
            if (updateError) {
                if (updateError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                throw new error_middleware_1.CustomError("Erro ao atualizar ticket", 500);
            }
            return ticket;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
    static async delete(id) {
        try {
            const { data: ticket, error: findError } = await supabase_1.default
                .from("tickets")
                .select(`
          *,
          compra:compras(id)
        `)
                .eq("id", id)
                .single();
            if (findError) {
                if (findError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                throw new error_middleware_1.CustomError("Erro ao buscar ticket", 500);
            }
            if (!ticket) {
                throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
            }
            if (ticket.compra) {
                throw new error_middleware_1.CustomError("Não é possível excluir ticket já convertido em compra", 400);
            }
            const { error: deleteError } = await supabase_1.default
                .from("tickets")
                .delete()
                .eq("id", id);
            if (deleteError) {
                if (deleteError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                throw new error_middleware_1.CustomError("Erro ao excluir ticket", 500);
            }
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
    static async convertToCompra(ticketId, precoPorKg) {
        try {
            const { data: ticket, error: ticketError } = await supabase_1.default
                .from("tickets")
                .select(`
          *,
          compra:compras(id)
        `)
                .eq("id", ticketId)
                .single();
            if (ticketError) {
                if (ticketError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
                }
                throw new error_middleware_1.CustomError("Erro ao buscar ticket", 500);
            }
            if (!ticket) {
                throw new error_middleware_1.CustomError("Ticket não encontrado", 404);
            }
            if (ticket.compra) {
                throw new error_middleware_1.CustomError("Ticket já foi convertido em compra", 400);
            }
            const precoPorArroba = precoPorKg * 15;
            const valorTotal = parseFloat(ticket.pesoLiquido) * precoPorKg;
            const { data: compra, error: compraError } = await supabase_1.default
                .from("compras")
                .insert([
                {
                    ticketId: ticket.id,
                    fornecedorId: ticket.fornecedorId,
                    precoPorArroba,
                    precoPorKg,
                    valorTotal,
                },
            ])
                .select(`
          *,
          ticket:tickets(*),
          fornecedor:fornecedores(
            id,
            nome,
            documento
          )
        `)
                .single();
            if (compraError) {
                throw new error_middleware_1.CustomError("Erro ao criar compra", 500);
            }
            const { error: updateError } = await supabase_1.default
                .from("tickets")
                .update({ status: "CONVERTIDO" })
                .eq("id", ticketId);
            if (updateError) {
                throw new error_middleware_1.CustomError("Erro ao atualizar status do ticket", 500);
            }
            return compra;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
    static removeUndefinedProperties(obj) {
        const result = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                result[key] = obj[key];
            }
        }
        return result;
    }
}
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map