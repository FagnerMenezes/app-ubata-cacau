"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorController = void 0;
const response_1 = require("../lib/response");
const error_middleware_1 = require("../middleware/error.middleware");
const fornecedor_service_1 = require("../services/fornecedor.service");
const types_1 = require("../types");
class FornecedorController {
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const data = types_1.CreateFornecedorSchema.parse(req.body);
        const fornecedor = await fornecedor_service_1.FornecedorService.create(data);
        return response_1.ResponseHelper.created(res, fornecedor, "Fornecedor criado com sucesso");
    });
    static findAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const query = types_1.FornecedorQuerySchema.parse(req.query);
        const result = await fornecedor_service_1.FornecedorService.findAll(query);
        return response_1.ResponseHelper.paginated(res, result.data, result.pagination);
    });
    static findById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        const fornecedor = await fornecedor_service_1.FornecedorService.findById(id);
        return response_1.ResponseHelper.success(res, fornecedor);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        const data = types_1.UpdateFornecedorSchema.parse(req.body);
        const fornecedor = await fornecedor_service_1.FornecedorService.update(id, data);
        return response_1.ResponseHelper.success(res, fornecedor, "Fornecedor atualizado com sucesso");
    });
    static delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        await fornecedor_service_1.FornecedorService.delete(id);
        return response_1.ResponseHelper.success(res, null, "Fornecedor excluído com sucesso");
    });
}
exports.FornecedorController = FornecedorController;
//# sourceMappingURL=fornecedor.controller.js.map