import { Request, Response } from "express";
import { CustomError } from "../middleware/error.middleware";
import { CompraService } from "../services/compra.service";

export class CompraController {
  static async findAll(req: Request, res: Response) {
    try {
      const resultado = await CompraService.listarCompras(req.query as any);
      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao listar compras:", error);

      // Verificar se é um erro customizado com statusCode
      if (error && typeof error.statusCode === "number") {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      // Para outros erros, retornar 500
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const compra = await CompraService.buscarPorId(id as string);
      return res.json(compra);
    } catch (error) {
      console.error("Erro ao buscar compra:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async converterTicket(req: Request, res: Response) {
    try {
      const compra = await CompraService.converterTicket(req.body);
      return res.status(201).json(compra);
    } catch (error) {
      console.error("Erro ao converter ticket:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const compraAtualizada = await CompraService.atualizar(
        id as string,
        req.body
      );
      return res.json(compraAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar compra:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resultado = await CompraService.deletar(id as string);
      return res.json(resultado);
    } catch (error) {
      console.error("Erro ao deletar compra:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
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
      const { periodo } = req.query;
      const estatisticas = await CompraService.obterEstatisticas(
        periodo as string
      );
      return res.json(estatisticas);
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async listarPorFornecedor(req: Request, res: Response) {
    try {
      const { fornecedorId } = req.params;

      const resultado = await CompraService.listarCompras({
        fornecedorId,
        ...(req.query as any),
      });

      return res.json(resultado);
    } catch (error) {
      console.error("Erro ao listar compras por fornecedor:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async calcularStatusPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const compra = await CompraService.buscarPorId(id as string);

      if (!compra) {
        return res.status(404).json({
          error: "Compra não encontrada",
        });
      }

      // Calcular status baseado nos pagamentos
      const totalPago =
        compra.pagamentos?.reduce(
          (sum: number, pag: any) => sum + pag.valorPago.toNumber(),
          0
        ) || 0;
      const valorTotal = Number(compra.valorTotal);

      let statusPagamento = "PENDENTE";
      if (totalPago >= valorTotal) {
        statusPagamento = "PAGO";
      } else if (totalPago > 0) {
        statusPagamento = "PARCIAL";
      }

      return res.json({
        compraId: id,
        valorTotal,
        totalPago,
        statusPagamento,
        saldoRestante: valorTotal - totalPago,
      });
    } catch (error) {
      console.error("Erro ao calcular status de pagamento:", error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }
}
