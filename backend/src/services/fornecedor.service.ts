import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase";
import { CustomError } from "../middleware/error.middleware";
import {
  CreateFornecedorInput,
  FornecedorQuery,
  UpdateFornecedorInput,
} from "../types";

export class FornecedorService {
  static async create(data: CreateFornecedorInput) {
    try {
      //console.log(data);

      // Verificar se já existe fornecedor com este documento
      const { data: existingFornecedor, error: checkError } = await supabase
        .from("fornecedores")
        .select("id")
        .eq("documento", data.documento)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new Error("Erro ao verificar fornecedor existente");
      }

      if (existingFornecedor) {
        throw new CustomError("Fornecedor com este documento já existe", 409);
      }

      // Criar objeto apenas com propriedades definidas
      const now = new Date().toISOString();
      const createData = {
        id: uuidv4(), // Gerar ID manualmente
        nome: data.nome,
        documento: data.documento,
        createdAt: now, // Definir data de criação
        updatedAt: now, // Definir data de atualização
        ...(data.contato !== undefined && { contato: data.contato }),
        ...(data.endereco !== undefined && { endereco: data.endereco }),
        ...(data.fazenda !== undefined && { fazenda: data.fazenda }),
        ...(data.observacoes !== undefined && {
          observacoes: data.observacoes,
        }),
        ...(data.saldo !== undefined && { saldo: data.saldo }),
      };

      const { data: fornecedor, error: createError } = await supabase
        .from("fornecedores")
        .insert([createData])
        .select()
        .single();

      if (createError) {
        console.error("Erro ao criar fornecedor:", createError);
        if (createError.code === "23505") {
          // Unique constraint violation
          throw new CustomError("Fornecedor com este documento já existe", 409);
        }
        throw new Error(`Erro ao criar fornecedor: ${createError.message}`);
      }

      return fornecedor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  static async findAll(query: FornecedorQuery) {
    const { page, limit, nome, documento } = query;
    const skip = (page - 1) * limit;
    const take = limit;

    // Buscar fornecedores com filtros
    let queryBuilder = supabase
      .from("fornecedores")
      .select("*")
      .order("nome", { ascending: true })
      .range(skip, skip + take - 1);

    // Aplicar filtros apenas se existirem
    if (nome) {
      queryBuilder = queryBuilder.ilike("nome", `%${nome}%`);
    }

    if (documento) {
      queryBuilder = queryBuilder.ilike("documento", `%${documento}%`);
    }

    const { data: fornecedores, error: fornecedoresError } = await queryBuilder;

    if (fornecedoresError) {
      console.error("Erro ao buscar fornecedores:", fornecedoresError);
      throw new Error(
        `Erro ao buscar fornecedores: ${fornecedoresError.message}`
      );
    }

    // Se não há fornecedores, retornar array vazio
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

    // Contar total para paginação
    let countQuery = supabase
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

    // Buscar contadores de tickets e compras para cada fornecedor
    const fornecedoresWithCount = await Promise.all(
      fornecedores.map(async (fornecedor) => {
        // Contar tickets
        const { count: ticketCount } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("fornecedorId", fornecedor.id);

        // Contar compras
        const { count: compraCount } = await supabase
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
      })
    );

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

  static async findById(id: string) {
    const { data: fornecedor, error: fornecedorError } = await supabase
      .from("fornecedores")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .single();

    if (fornecedorError) {
      if (fornecedorError.code === "PGRST116") {
        throw new CustomError("Fornecedor não encontrado", 404);
      }
      throw new Error("Erro ao buscar fornecedor");
    }

    if (!fornecedor) {
      throw new CustomError("Fornecedor não encontrado", 404);
    }

    // Ordenar tickets e compras por data de criação (mais recentes primeiro)
    const sortedTickets =
      fornecedor.tickets
        ?.slice(0, 10)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];

    const sortedCompras =
      fornecedor.compras
        ?.slice(0, 10)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];

    // Contar tickets e compras
    const { data: ticketCount, error: ticketCountError } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("fornecedorId", id);

    const { data: compraCount, error: compraCountError } = await supabase
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

  static async update(id: string, data: UpdateFornecedorInput) {
    console.log(data);

    // Verificar se há dados para atualizar
    if (!data || Object.keys(data).length === 0) {
      throw new CustomError("Nenhum dado fornecido para atualização", 400);
    }

    // Criar objeto apenas com propriedades definidas
    const updateData: any = {};

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.documento !== undefined) updateData.documento = data.documento;
    if (data.contato !== undefined) updateData.contato = data.contato;
    if (data.endereco !== undefined) updateData.endereco = data.endereco;
    if (data.fazenda !== undefined) updateData.fazenda = data.fazenda;
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;
    if (data.saldo !== undefined) updateData.saldo = data.saldo;

    // Verificar se há pelo menos um campo para atualizar
    if (Object.keys(updateData).length === 0) {
      throw new CustomError(
        "Nenhum dado válido fornecido para atualização",
        400
      );
    }

    try {
      // Adicionar updatedAt ao updateData
      const updateDataWithTimestamp = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const { data: fornecedor, error: updateError } = await supabase
        .from("fornecedores")
        .update(updateDataWithTimestamp)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === "PGRST116") {
          throw new CustomError("Fornecedor não encontrado", 404);
        }
        if (updateError.code === "23505") {
          throw new CustomError("Fornecedor com este documento já existe", 409);
        }
        throw new Error("Erro ao atualizar fornecedor");
      }

      return fornecedor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      // Verificar se há compras ou tickets associados
      const { data: fornecedor, error: fornecedorError } = await supabase
        .from("fornecedores")
        .select(
          `
          id,
          tickets:tickets(count),
          compras:compras(count)
        `
        )
        .eq("id", id)
        .single();

      if (fornecedorError) {
        if (fornecedorError.code === "PGRST116") {
          throw new CustomError("Fornecedor não encontrado", 404);
        }
        throw new Error("Erro ao buscar fornecedor");
      }

      if (!fornecedor) {
        throw new CustomError("Fornecedor não encontrado", 404);
      }

      const ticketCount = fornecedor.tickets?.[0]?.count || 0;
      const compraCount = fornecedor.compras?.[0]?.count || 0;

      if (ticketCount > 0 || compraCount > 0) {
        throw new CustomError(
          "Não é possível excluir fornecedor com tickets ou compras associadas",
          400
        );
      }

      const { error: deleteError } = await supabase
        .from("fornecedores")
        .delete()
        .eq("id", id);

      if (deleteError) {
        if (deleteError.code === "PGRST116") {
          throw new CustomError("Fornecedor não encontrado", 404);
        }
        throw new Error("Erro ao excluir fornecedor");
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  static async getSaldo(id: string) {
    const { data: fornecedor, error: fornecedorError } = await supabase
      .from("fornecedores")
      .select("saldo")
      .eq("id", id)
      .single();

    if (fornecedorError) {
      if (fornecedorError.code === "PGRST116") {
        throw new CustomError("Fornecedor não encontrado", 404);
      }
      throw new Error("Erro ao buscar fornecedor");
    }

    if (!fornecedor) {
      throw new CustomError("Fornecedor não encontrado", 404);
    }

    return parseFloat(fornecedor.saldo);
  }

  static async updateSaldo(id: string, novoSaldo: number) {
    try {
      const { data: fornecedor, error: updateError } = await supabase
        .from("fornecedores")
        .update({ saldo: novoSaldo })
        .eq("id", id)
        .select("saldo")
        .single();

      if (updateError) {
        if (updateError.code === "PGRST116") {
          throw new CustomError("Fornecedor não encontrado", 404);
        }
        throw new Error("Erro ao atualizar saldo");
      }

      return parseFloat(fornecedor.saldo);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }
}
