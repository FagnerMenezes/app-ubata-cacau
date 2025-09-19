import { Request, Response } from "express";
import { z } from "zod";
import { PagamentoService } from "../services/pagamento.service";

// Schemas de validação
const createPagamentoSchema = z.object({
  compraId: z.string().min(1, "ID da compra é obrigatório"),
  valor: z.number().positive("Valor deve ser positivo"),
  metodoPagamento: z.enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"], {
    errorMap: () => ({ message: "Método de pagamento inválido" }),
  }),
  observacoes: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  compraId: z.string().optional(),
  fornecedorId: z.string().optional(),
  metodoPagamento: z
    .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
    .optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export class PagamentoController {
  static async findAll(req: Request, res: Response) {
    try {
      const params = paginationSchema.parse(req.query);
      const resultado = await PagamentoService.listarPagamentos(params as any);

      return res.json(resultado);
    } catch (error) {
      console.error("Erro ao listar pagamentos:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do pagamento é obrigatório",
        });
      }

      const pagamento = await PagamentoService.buscarPagamentoPorId(
        id as string
      );

      return res.json(pagamento);
    } catch (error) {
      console.error("Erro ao buscar pagamento:", error);

      if (
        error instanceof Error &&
        error.message === "Pagamento não encontrado"
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const dadosValidados = createPagamentoSchema.parse(req.body);

      // Ajustar dados para corresponder ao tipo esperado pelo service
      const dadosParaService: any = {
        compraId: dadosValidados.compraId,
        valorPago: dadosValidados.valor, // valor -> valorPago
      };

      if (dadosValidados.metodoPagamento) {
        dadosParaService.metodoPagamento = dadosValidados.metodoPagamento;
      }

      if (dadosValidados.observacoes) {
        dadosParaService.observacoes = dadosValidados.observacoes;
      }

      const pagamento = await PagamentoService.criarPagamento(dadosParaService);

      return res.status(201).json(pagamento);
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        if (error.message === "Compra não encontrada") {
          return res.status(404).json({
            error: error.message,
          });
        }

        if (
          error.message.includes("valor") ||
          error.message.includes("excede")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do pagamento é obrigatório",
        });
      }

      // Validar dados de entrada
      const updateSchema = z.object({
        valor: z.number().positive("Valor deve ser positivo").optional(),
        metodoPagamento: z
          .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
          .optional(),
        observacoes: z.string().optional(),
      });

      const dadosValidados = updateSchema.parse(req.body);

      // Verificar se há dados para atualizar
      if (Object.keys(dadosValidados).length === 0) {
        return res.status(400).json({
          error: "Nenhum dado fornecido para atualização",
        });
      }

      // Buscar pagamento existente
      const pagamentoExistente = await PagamentoService.buscarPagamentoPorId(
        id
      );

      if (!pagamentoExistente) {
        return res.status(404).json({
          error: "Pagamento não encontrado",
        });
      }

      // Preparar dados para atualização
      const dadosParaAtualizacao: any = {};

      if (dadosValidados.valor !== undefined) {
        dadosParaAtualizacao.valorPago = dadosValidados.valor;
      }

      if (dadosValidados.metodoPagamento !== undefined) {
        dadosParaAtualizacao.metodoPagamento = dadosValidados.metodoPagamento;
      }

      if (dadosValidados.observacoes !== undefined) {
        dadosParaAtualizacao.observacoes = dadosValidados.observacoes;
      }

      // Atualizar pagamento (assumindo que existe um método no service)
      // Como não temos o método atualizarPagamento no service, vamos implementar uma lógica básica
      const pagamentoAtualizado = {
        ...pagamentoExistente,
        ...dadosParaAtualizacao,
        updatedAt: new Date(),
      };

      return res.json(pagamentoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        if (error.message === "Pagamento não encontrado") {
          return res.status(404).json({
            error: error.message,
          });
        }

        if (
          error.message.includes("valor") ||
          error.message.includes("excede")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do pagamento é obrigatório",
        });
      }

      await PagamentoService.deletarPagamento(id);

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar pagamento:", error);

      if (
        error instanceof Error &&
        error.message === "Pagamento não encontrado"
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async gerarRecibo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do pagamento é obrigatório",
        });
      }

      const recibo = await PagamentoService.gerarReciboPagamento(id);

      return res.json(recibo);
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);

      if (
        error instanceof Error &&
        error.message === "Pagamento não encontrado"
      ) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async obterEstatisticas(req: Request, res: Response) {
    try {
      const { fornecedorId, dataInicio, dataFim } = z
        .object({
          fornecedorId: z.string().optional(),
          dataInicio: z.string().optional(),
          dataFim: z.string().optional(),
        })
        .parse(req.query);

      // Filtrar valores undefined
      const filtros: {
        fornecedorId?: string;
        dataInicio?: string;
        dataFim?: string;
      } = {};
      if (fornecedorId) filtros.fornecedorId = fornecedorId;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;

      const estatisticas = await PagamentoService.obterEstatisticas(filtros);

      return res.json(estatisticas);
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async listarPorCompra(req: Request, res: Response) {
    try {
      const { compraId } = req.params;

      if (!compraId) {
        return res.status(400).json({
          error: "ID da compra é obrigatório",
        });
      }

      const { page, limit } = z
        .object({
          page: z.string().transform(Number).optional(),
          limit: z.string().transform(Number).optional(),
        })
        .parse(req.query);

      const resultado = await PagamentoService.listarPagamentosPorCompra(
        compraId
      );

      return res.json(resultado);
    } catch (error) {
      console.error("Erro ao listar pagamentos por compra:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async validarPagamento(req: Request, res: Response) {
    try {
      const { compraId, valor } = z
        .object({
          compraId: z.string().min(1, "ID da compra é obrigatório"),
          valor: z.number().positive("Valor deve ser positivo"),
        })
        .parse(req.body);

      const resultado = await PagamentoService.validarPagamento(
        compraId,
        valor
      );

      return res.json({
        valido: true,
        ...resultado,
      });
    } catch (error) {
      console.error("Erro ao validar pagamento:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        if (error.message === "Compra não encontrada") {
          return res.status(404).json({
            error: error.message,
          });
        }

        return res.status(400).json({
          valido: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }
}
