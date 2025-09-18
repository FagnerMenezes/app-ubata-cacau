import { Prisma } from "@prisma/client";
import { CustomError } from "../middleware/error.middleware";
import {
  CreateFornecedorInput,
  FornecedorQuery,
  UpdateFornecedorInput,
} from "../types";
import { BaseService } from "./base.service";

export class FornecedorService extends BaseService {
  static async create(data: CreateFornecedorInput) {
    try {
      console.log(data);
      // Criar objeto apenas com propriedades definidas
      const createData = {
        nome: data.nome,
        documento: data.documento,
        ...(data.contato !== undefined && { contato: data.contato }),
        ...(data.endereco !== undefined && { endereco: data.endereco }),
        ...(data.fazenda !== undefined && { fazenda: data.fazenda }),
        ...(data.observacoes !== undefined && {
          observacoes: data.observacoes,
        }),
        ...(data.saldo !== undefined && { saldo: data.saldo }),
      };

      return await this.prisma.fornecedor.create({
        data: createData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CustomError("Fornecedor com este documento já existe", 409);
      }
      throw error;
    }
  }

  static async findAll(query: FornecedorQuery) {
    const { page, limit, nome, documento } = query;
    const { skip, take } = this.getPaginationParams(page, limit);

    const where: Prisma.FornecedorWhereInput = {};

    if (nome) {
      where.nome = { contains: nome, mode: "insensitive" };
    }

    if (documento) {
      where.documento = { contains: documento, mode: "insensitive" };
    }

    const [fornecedores, total] = await Promise.all([
      this.prisma.fornecedor.findMany({
        where,
        skip,
        take,
        orderBy: { nome: "asc" },
        include: {
          _count: {
            select: {
              tickets: true,
              compras: true,
            },
          },
        },
      }),
      this.prisma.fornecedor.count({ where }),
    ]);

    return {
      data: fornecedores,
      pagination: this.calculatePagination(page, limit, total),
    };
  }

  static async findById(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        compras: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            ticket: {
              select: {
                pesoLiquido: true,
                pesoBruto: true,
              },
            },
          },
        },
        _count: {
          select: {
            tickets: true,
            compras: true,
          },
        },
      },
    });

    return this.handleNotFound(fornecedor, "Fornecedor", id);
  }

  static async update(id: string, data: UpdateFornecedorInput) {
    console.log(data);
    // Verificar se há dados para atualizar
    if (!data || Object.keys(data).length === 0) {
      throw new CustomError("Nenhum dado fornecido para atualização", 400);
    }

    // Criar objeto apenas com propriedades definidas
    const updateData: Prisma.FornecedorUpdateInput = {};

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
      const fornecedor = await this.prisma.fornecedor.update({
        where: { id },
        data: updateData,
      });
      return fornecedor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new CustomError("Fornecedor não encontrado", 404);
        }
        if (error.code === "P2002") {
          throw new CustomError("Fornecedor com este documento já existe", 409);
        }
      }
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      // Verificar se há compras ou tickets associados
      const fornecedor = await this.prisma.fornecedor.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              tickets: true,
              compras: true,
            },
          },
        },
      });

      if (!fornecedor) {
        throw new CustomError("Fornecedor não encontrado", 404);
      }

      if (fornecedor._count.tickets > 0 || fornecedor._count.compras > 0) {
        throw new CustomError(
          "Não é possível excluir fornecedor com tickets ou compras associadas",
          400
        );
      }

      await this.prisma.fornecedor.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CustomError("Fornecedor não encontrado", 404);
      }
      throw error;
    }
  }

  static async getSaldo(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      select: { saldo: true },
    });

    if (!fornecedor) {
      throw new CustomError("Fornecedor não encontrado", 404);
    }

    return Number(fornecedor.saldo);
  }

  static async updateSaldo(id: string, novoSaldo: number) {
    try {
      const fornecedor = await this.prisma.fornecedor.update({
        where: { id },
        data: { saldo: novoSaldo },
      });
      return Number(fornecedor.saldo);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CustomError("Fornecedor não encontrado", 404);
      }
      throw error;
    }
  }
}
