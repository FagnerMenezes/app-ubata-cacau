import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase";
import { CustomError } from "../middleware/error.middleware";
import { CreateTicketInput, TicketQuery, UpdateTicketInput } from "../types";

export class TicketService {
  static async create(data: CreateTicketInput) {
    // Verificar se o fornecedor existe
    const { data: fornecedor, error: fornecedorError } = await supabase
      .from("fornecedores")
      .select("*")
      .eq("id", data.fornecedorId)
      .single();

    if (fornecedorError) {
      if (fornecedorError.code === "PGRST116") {
        throw new CustomError("Fornecedor não encontrado", 404);
      }
      throw new CustomError("Erro ao buscar fornecedor", 500);
    }

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

    // Criar ticket
    const now = new Date().toISOString();
    const ticketData = {
      id: uuidv4(), // Gerar ID manualmente
      createdAt: now, // Definir data de criação
      updatedAt: now, // Definir data de atualização
      ...data,
    };

    const { data: ticket, error: createError } = await supabase
      .from("tickets")
      .insert([ticketData])
      .select(
        `
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        )
      `
      )
      .single();

    if (createError) {
      throw new CustomError("Erro ao criar ticket", 500);
    }

    return ticket;
  }

  static async findAll(query: TicketQuery) {
    const { page, limit, fornecedorId, status, dataInicio, dataFim } = query;
    const skip = (page - 1) * limit;
    const take = limit;

    // Construir query base
    let queryBuilder = supabase
      .from("tickets")
      .select(
        `
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
      `
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    // Aplicar filtros
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
      throw new CustomError("Erro ao buscar tickets", 500);
    }

    // Contar total para paginação
    let countQuery = supabase
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
      throw new CustomError("Erro ao contar tickets", 500);
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
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(
        `
        *,
        fornecedor:fornecedores(
          id,
          nome,
          documento
        ),
        compras(id)
      `
      )
      .eq("status", "PENDENTE")
      .order("createdAt", { ascending: false });

    if (ticketsError) {
      console.error("Erro na query findAvailable:", ticketsError);
      throw new CustomError("Erro ao buscar tickets disponíveis", 500);
    }

    // Filtrar tickets que não têm compra associada
    const availableTickets = tickets?.filter(ticket => {
      return !ticket.compras || ticket.compras.length === 0;
    }) || [];

    return availableTickets;
  }

  static async findById(id: string) {
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .single();

    if (ticketError) {
      if (ticketError.code === "PGRST116") {
        throw new CustomError("Ticket não encontrado", 404);
      }
      throw new CustomError("Erro ao buscar ticket", 500);
    }

    if (!ticket) {
      throw new CustomError("Ticket não encontrado", 404);
    }

    return ticket;
  }

  static async update(id: string, data: UpdateTicketInput) {
    try {
      // Verificar se o ticket existe e não foi convertido
      const { data: ticketExistente, error: findError } = await supabase
        .from("tickets")
        .select(
          `
          *,
          compra:compras(id)
        `
        )
        .eq("id", id)
        .single();

      if (findError) {
        if (findError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        throw new CustomError("Erro ao buscar ticket", 500);
      }

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
      const pesoBruto = data.pesoBruto ?? parseFloat(ticketExistente.pesoBruto);
      const pesoLiquido =
        data.pesoLiquido ?? parseFloat(ticketExistente.pesoLiquido);

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

      // Adicionar updatedAt ao updateData
      const updateDataWithTimestamp = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const { data: ticket, error: updateError } = await supabase
        .from("tickets")
        .update(updateDataWithTimestamp)
        .eq("id", id)
        .select(
          `
          *,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          )
        `
        )
        .single();

      if (updateError) {
        if (updateError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        throw new CustomError("Erro ao atualizar ticket", 500);
      }

      return ticket;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      // Verificar se o ticket existe e não foi convertido
      const { data: ticket, error: findError } = await supabase
        .from("tickets")
        .select(
          `
          *,
          compra:compras(id)
        `
        )
        .eq("id", id)
        .single();

      if (findError) {
        if (findError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        throw new CustomError("Erro ao buscar ticket", 500);
      }

      if (!ticket) {
        throw new CustomError("Ticket não encontrado", 404);
      }

      if (ticket.compra) {
        throw new CustomError(
          "Não é possível excluir ticket já convertido em compra",
          400
        );
      }

      const { error: deleteError } = await supabase
        .from("tickets")
        .delete()
        .eq("id", id);

      if (deleteError) {
        if (deleteError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        throw new CustomError("Erro ao excluir ticket", 500);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  static async convertToCompra(ticketId: string, precoPorKg: number) {
    try {
      // Buscar o ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(
          `
          *,
          compra:compras(id)
        `
        )
        .eq("id", ticketId)
        .single();

      if (ticketError) {
        if (ticketError.code === "PGRST116") {
          throw new CustomError("Ticket não encontrado", 404);
        }
        throw new CustomError("Erro ao buscar ticket", 500);
      }

      if (!ticket) {
        throw new CustomError("Ticket não encontrado", 404);
      }

      if (ticket.compra) {
        throw new CustomError("Ticket já foi convertido em compra", 400);
      }

      // Calcular valores
      const precoPorArroba = precoPorKg * 15; // 1 arroba = 15 kg
      const valorTotal = parseFloat(ticket.pesoLiquido) * precoPorKg;

      // Criar a compra
      const { data: compra, error: compraError } = await supabase
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
        .select(
          `
          *,
          ticket:tickets(*),
          fornecedor:fornecedores(
            id,
            nome,
            documento
          )
        `
        )
        .single();

      if (compraError) {
        throw new CustomError("Erro ao criar compra", 500);
      }

      // Atualizar status do ticket
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: "CONVERTIDO" })
        .eq("id", ticketId);

      if (updateError) {
        throw new CustomError("Erro ao atualizar status do ticket", 500);
      }

      return compra;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Remove propriedades undefined de um objeto para compatibilidade com exactOptionalPropertyTypes
   */
  private static removeUndefinedProperties<T extends Record<string, any>>(
    obj: T
  ): Partial<T> {
    const result: Partial<T> = {};

    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }

    return result;
  }
}
