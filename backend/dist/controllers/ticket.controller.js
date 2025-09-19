"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const response_1 = require("../lib/response");
const error_middleware_1 = require("../middleware/error.middleware");
const ticket_service_1 = require("../services/ticket.service");
const types_1 = require("../types");
class TicketController {
    static create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const data = types_1.CreateTicketSchema.parse(req.body);
        const ticket = await ticket_service_1.TicketService.create(data);
        return response_1.ResponseHelper.created(res, ticket, "Ticket criado com sucesso");
    });
    static findAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const query = types_1.TicketQuerySchema.parse(req.query);
        const result = await ticket_service_1.TicketService.findAll(query);
        return response_1.ResponseHelper.paginated(res, result.data, result.pagination);
    });
    static findAvailable = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const tickets = await ticket_service_1.TicketService.findAvailable();
        return response_1.ResponseHelper.success(res, tickets);
    });
    static findById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        const ticket = await ticket_service_1.TicketService.findById(id);
        return response_1.ResponseHelper.success(res, ticket);
    });
    static update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        const data = types_1.UpdateTicketSchema.parse(req.body);
        const ticket = await ticket_service_1.TicketService.update(id, data);
        return response_1.ResponseHelper.success(res, ticket, "Ticket atualizado com sucesso");
    });
    static delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id } = types_1.ParamsIdSchema.parse(req.params);
        await ticket_service_1.TicketService.delete(id);
        return response_1.ResponseHelper.success(res, null, "Ticket excluído com sucesso");
    });
    static convertToCompra = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { id, precokg } = types_1.ParamsIdSchema.parse(req.params);
        const compra = await ticket_service_1.TicketService.convertToCompra(id, precokg || 0);
        return response_1.ResponseHelper.success(res, compra, "Ticket convertido em compra com sucesso");
    });
}
exports.TicketController = TicketController;
//# sourceMappingURL=ticket.controller.js.map