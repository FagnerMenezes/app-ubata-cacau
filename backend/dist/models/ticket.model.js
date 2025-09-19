"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketModel = void 0;
const prisma_1 = require("../lib/prisma");
class TicketModel {
    static async findMany(params) {
        return prisma_1.prisma.ticket.findMany(params);
    }
    static async findUnique(params) {
        return prisma_1.prisma.ticket.findUnique(params);
    }
    static async create(data) {
        const pesoLiquido = data.pesoBruto - data.tara;
        return prisma_1.prisma.ticket.create({
            data: {
                fornecedorId: data.fornecedorId,
                pesoBruto: data.pesoBruto,
                pesoLiquido,
                observacoes: data.observacoes,
                status: "CONVERTIDO",
            },
            include: {
                fornecedor: {
                    select: {
                        id: true,
                        nome: true,
                        documento: true,
                    },
                },
            },
        });
    }
    static async update(params) {
        if (params.data.pesoBruto !== undefined || params.data.tara !== undefined) {
            const ticket = await prisma_1.prisma.ticket.findUnique({
                where: params.where,
            });
            if (ticket) {
                const pesoBruto = params.data.pesoBruto ?? ticket.pesoBruto;
                const tara = params.data.tara ?? ticket.pesoBruto;
                params.data.pesoLiquido = pesoBruto.toNumber() - tara.toNumber();
            }
        }
        return prisma_1.prisma.ticket.update(params);
    }
    static async delete(where) {
        return prisma_1.prisma.ticket.delete({ where });
    }
    static async count(where) {
        return prisma_1.prisma.ticket.count({ where: where || {} });
    }
    static async findPendentes() {
        return prisma_1.prisma.ticket.findMany({
            where: {
                status: "PENDENTE",
                compra: null,
            },
            include: {
                fornecedor: {
                    select: {
                        id: true,
                        nome: true,
                        documento: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    static async updateStatus(id, status) {
        return prisma_1.prisma.ticket.update({
            where: { id },
            data: { status: status },
        });
    }
    static async aggregate(params) {
        return prisma_1.prisma.ticket.aggregate(params);
    }
}
exports.TicketModel = TicketModel;
//# sourceMappingURL=ticket.model.js.map