import { Request, Response } from "express";
import { ResponseHelper } from "../lib/response";
import { asyncHandler } from "../middleware/error.middleware";
import { FornecedorService } from "../services/fornecedor.service";
import {
  CreateFornecedorSchema,
  FornecedorQuerySchema,
  ParamsIdSchema,
  UpdateFornecedorSchema,
} from "../types";

export class FornecedorController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateFornecedorSchema.parse(req.body);
    const fornecedor = await FornecedorService.create(data);

    return ResponseHelper.created(
      res,
      fornecedor,
      "Fornecedor criado com sucesso"
    );
  });

  static findAll = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar com Zod em vez de usar 'as any'
    const query = FornecedorQuerySchema.parse(req.query);
    const result = await FornecedorService.findAll(query);

    return ResponseHelper.paginated(res, result.data, result.pagination);
  });

  static findById = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros também
    const { id } = ParamsIdSchema.parse(req.params);
    const fornecedor = await FornecedorService.findById(id);

    return ResponseHelper.success(res, fornecedor);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id } = ParamsIdSchema.parse(req.params);
    const data = UpdateFornecedorSchema.parse(req.body);
    const fornecedor = await FornecedorService.update(id, data);

    return ResponseHelper.success(
      res,
      fornecedor,
      "Fornecedor atualizado com sucesso"
    );
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    // ✅ CORREÇÃO: Validar parâmetros
    const { id } = ParamsIdSchema.parse(req.params);
    await FornecedorService.delete(id);

    return ResponseHelper.success(res, null, "Fornecedor excluído com sucesso");
  });
}
