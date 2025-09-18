import { Request, Response } from "express";
import { ResponseHelper } from "../lib/response";
import { asyncHandler } from "../middleware/error.middleware";
import { TicketService } from "../services/ticket.service";
import {
  CreateTicketSchema,
  ParamsIdSchema,
  TicketQuerySchema,
  UpdateTicketSchema,
} from "../types";

export class TicketController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateTicketSchema.parse(req.body);
    const ticket = await TicketService.create(data);

    return ResponseHelper.created(res, ticket, "Ticket criado com sucesso");
  });

  static findAll = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar com Zod em vez de usar 'as any'
    const query = TicketQuerySchema.parse(req.query);
    const result = await TicketService.findAll(query);

    return ResponseHelper.paginated(res, result.data, result.pagination);
  });

  static findAvailable = asyncHandler(async (req: Request, res: Response) => {
    const tickets = await TicketService.findAvailable();
    return ResponseHelper.success(res, tickets);
  });

  static findById = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id } = ParamsIdSchema.parse(req.params);
    const ticket = await TicketService.findById(id);

    return ResponseHelper.success(res, ticket);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id } = ParamsIdSchema.parse(req.params);
    const data = UpdateTicketSchema.parse(req.body);
    const ticket = await TicketService.update(id, data);

    return ResponseHelper.success(res, ticket, "Ticket atualizado com sucesso");
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id } = ParamsIdSchema.parse(req.params);
    await TicketService.delete(id);

    return ResponseHelper.success(res, null, "Ticket excluído com sucesso");
  });

  static convertToCompra = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id, precokg } = ParamsIdSchema.parse(req.params);
    const compra = await TicketService.convertToCompra(id, precokg || 0);

    return ResponseHelper.success(
      res,
      compra,
      "Ticket convertido em compra com sucesso"
    );
  });
}
