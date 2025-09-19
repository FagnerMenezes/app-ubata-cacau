"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorService = void 0;
const uuid_1 = require("uuid");
const supabase_1 = __importDefault(require("../lib/supabase"));
const error_middleware_1 = require("../middleware/error.middleware");
class FornecedorService {
    static async create(data) {
        try {
            const { data: existingFornecedor, error: checkError } = await supabase_1.default
                .from("fornecedores")
                .select("id")
                .eq("documento", data.documento)
                .single();
            if (checkError && checkError.code !== "PGRST116") {
                throw new Error("Erro ao verificar fornecedor existente");
            }
            if (existingFornecedor) {
                throw new error_middleware_1.CustomError("Fornecedor com este documento já existe", 409);
            }
            const now = new Date().toISOString();
            const createData = {
                id: (0, uuid_1.v4)(),
                nome: data.nome,
                documento: data.documento,
                createdAt: now,
                updatedAt: now,
                ...(data.contato !== undefined && { contato: data.contato }),
                ...(data.endereco !== undefined && { endereco: data.endereco }),
                ...(data.fazenda !== undefined && { fazenda: data.fazenda }),
                ...(data.observacoes !== undefined && {
                    observacoes: data.observacoes,
                }),
                ...(data.saldo !== undefined && { saldo: data.saldo }),
            };
            const { data: fornecedor, error: createError } = await supabase_1.default
                .from("fornecedores")
                .insert([createData])
                .select()
                .single();
            if (createError) {
                console.error("Erro ao criar fornecedor:", createError);
                if (createError.code === "23505") {
                    throw new error_middleware_1.CustomError("Fornecedor com este documento já existe", 409);
                }
                throw new Error(`Erro ao criar fornecedor: ${createError.message}`);
            }
            return fornecedor;
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
    static async findAll(query) {
        const { page, limit, nome, documento } = query;
        const skip = (page - 1) * limit;
        const take = limit;
        let queryBuilder = supabase_1.default
            .from("fornecedores")
            .select("*")
            .order("nome", { ascending: true })
            .range(skip, skip + take - 1);
        if (nome) {
            queryBuilder = queryBuilder.ilike("nome", `%${nome}%`);
        }
        if (documento) {
            queryBuilder = queryBuilder.ilike("documento", `%${documento}%`);
        }
        const { data: fornecedores, error: fornecedoresError } = await queryBuilder;
        if (fornecedoresError) {
            console.error("Erro ao buscar fornecedores:", fornecedoresError);
            throw new Error(`Erro ao buscar fornecedores: ${fornecedoresError.message}`);
        }
        if (!fornecedores || fornecedores.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        let countQuery = supabase_1.default
            .from("fornecedores")
            .select("*", { count: "exact", head: true });
        if (nome) {
            countQuery = countQuery.ilike("nome", `%${nome}%`);
        }
        if (documento) {
            countQuery = countQuery.ilike("documento", `%${documento}%`);
        }
        const { count: total, error: countError } = await countQuery;
        if (countError) {
            console.error("Erro ao contar fornecedores:", countError);
            throw new Error(`Erro ao contar fornecedores: ${countError.message}`);
        }
        const fornecedoresWithCount = await Promise.all(fornecedores.map(async (fornecedor) => {
            const { count: ticketCount } = await supabase_1.default
                .from("tickets")
                .select("*", { count: "exact", head: true })
                .eq("fornecedorId", fornecedor.id);
            const { count: compraCount } = await supabase_1.default
                .from("compras")
                .select("*", { count: "exact", head: true })
                .eq("fornecedorId", fornecedor.id);
            return {
                ...fornecedor,
                _count: {
                    tickets: ticketCount || 0,
                    compras: compraCount || 0,
                },
            };
        }));
        return {
            data: fornecedoresWithCount,
            pagination: {
                page,
                limit,
                total: total || 0,
                totalPages: Math.ceil((total || 0) / limit),
            },
        };
    }
    static async findById(id) {
        const { data: fornecedor, error: fornecedorError } = await supabase_1.default
            .from("fornecedores")
            .select(`
        *,
        tickets:tickets(
          id,
          pesoBruto,
          pesoLiquido,
          observacoes,
          status,
          createdAt,
          updatedAt
        ),
        compras:compras(
          id,
          precoPorKg,
          valorTotal,
          statusPagamento,
          observacoes,
          createdAt,
          updatedAt,
          ticket:tickets(
            pesoLiquido,
            pesoBruto
          )
        )
      `)
            .eq("id", id)
            .single();
        if (fornecedorError) {
            if (fornecedorError.code === "PGRST116") {
                throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
            }
            throw new Error("Erro ao buscar fornecedor");
        }
        if (!fornecedor) {
            throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
        }
        const sortedTickets = fornecedor.tickets
            ?.slice(0, 10)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
        const sortedCompras = fornecedor.compras
            ?.slice(0, 10)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
        const { data: ticketCount, error: ticketCountError } = await supabase_1.default
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("fornecedorId", id);
        const { data: compraCount, error: compraCountError } = await supabase_1.default
            .from("compras")
            .select("*", { count: "exact", head: true })
            .eq("fornecedorId", id);
        return {
            ...fornecedor,
            tickets: sortedTickets,
            compras: sortedCompras,
            _count: {
                tickets: ticketCount?.length || 0,
                compras: compraCount?.length || 0,
            },
        };
    }
    static async update(id, data) {
        console.log(data);
        if (!data || Object.keys(data).length === 0) {
            throw new error_middleware_1.CustomError("Nenhum dado fornecido para atualização", 400);
        }
        const updateData = {};
        if (data.nome !== undefined)
            updateData.nome = data.nome;
        if (data.documento !== undefined)
            updateData.documento = data.documento;
        if (data.contato !== undefined)
            updateData.contato = data.contato;
        if (data.endereco !== undefined)
            updateData.endereco = data.endereco;
        if (data.fazenda !== undefined)
            updateData.fazenda = data.fazenda;
        if (data.observacoes !== undefined)
            updateData.observacoes = data.observacoes;
        if (data.saldo !== undefined)
            updateData.saldo = data.saldo;
        if (Object.keys(updateData).length === 0) {
            throw new error_middleware_1.CustomError("Nenhum dado válido fornecido para atualização", 400);
        }
        try {
            const updateDataWithTimestamp = {
                ...updateData,
                updatedAt: new Date().toISOString(),
            };
            const { data: fornecedor, error: updateError } = await supabase_1.default
                .from("fornecedores")
                .update(updateDataWithTimestamp)
                .eq("id", id)
                .select()
                .single();
            if (updateError) {
                if (updateError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
                }
                if (updateError.code === "23505") {
                    throw new error_middleware_1.CustomError("Fornecedor com este documento já existe", 409);
                }
                throw new Error("Erro ao atualizar fornecedor");
            }
            return fornecedor;
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
            const { data: fornecedor, error: fornecedorError } = await supabase_1.default
                .from("fornecedores")
                .select(`
          id,
          tickets:tickets(count),
          compras:compras(count)
        `)
                .eq("id", id)
                .single();
            if (fornecedorError) {
                if (fornecedorError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
                }
                throw new Error("Erro ao buscar fornecedor");
            }
            if (!fornecedor) {
                throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
            }
            const ticketCount = fornecedor.tickets?.[0]?.count || 0;
            const compraCount = fornecedor.compras?.[0]?.count || 0;
            if (ticketCount > 0 || compraCount > 0) {
                throw new error_middleware_1.CustomError("Não é possível excluir fornecedor com tickets ou compras associadas", 400);
            }
            const { error: deleteError } = await supabase_1.default
                .from("fornecedores")
                .delete()
                .eq("id", id);
            if (deleteError) {
                if (deleteError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
                }
                throw new Error("Erro ao excluir fornecedor");
            }
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
    static async getSaldo(id) {
        const { data: fornecedor, error: fornecedorError } = await supabase_1.default
            .from("fornecedores")
            .select("saldo")
            .eq("id", id)
            .single();
        if (fornecedorError) {
            if (fornecedorError.code === "PGRST116") {
                throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
            }
            throw new Error("Erro ao buscar fornecedor");
        }
        if (!fornecedor) {
            throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
        }
        return parseFloat(fornecedor.saldo);
    }
    static async updateSaldo(id, novoSaldo) {
        try {
            const { data: fornecedor, error: updateError } = await supabase_1.default
                .from("fornecedores")
                .update({ saldo: novoSaldo })
                .eq("id", id)
                .select("saldo")
                .single();
            if (updateError) {
                if (updateError.code === "PGRST116") {
                    throw new error_middleware_1.CustomError("Fornecedor não encontrado", 404);
                }
                throw new Error("Erro ao atualizar saldo");
            }
            return parseFloat(fornecedor.saldo);
        }
        catch (error) {
            if (error instanceof error_middleware_1.CustomError) {
                throw error;
            }
            throw error;
        }
    }
}
exports.FornecedorService = FornecedorService;
//# sourceMappingURL=fornecedor.service.js.map