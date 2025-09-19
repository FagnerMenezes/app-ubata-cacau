"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentoModel = void 0;
const prisma_1 = require("../lib/prisma");
class PagamentoModel {
    static async findMany(params) {
        return prisma_1.prisma.pagamento.findMany(params);
    }
    static async findUnique(params) {
        const result = await prisma_1.prisma.pagamento.findUnique(params);
        if (!result)
            return null;
        return result;
    }
    static async create(data) {
        return prisma_1.prisma.pagamento.create({
            data: {
                compraId: data.compraId,
                valorPago: data.valorPago,
            },
            include: {
                compra: {
                    include: {
                        fornecedor: true,
                        ticket: true,
                    },
                },
            },
        });
    }
    static async delete(where) {
        return prisma_1.prisma.pagamento.delete({ where });
    }
    static async count(where) {
        return prisma_1.prisma.pagamento.count({ where: where || {} });
    }
    static async findByCompraId(compraId) {
        return prisma_1.prisma.pagamento.findMany({
            where: { compraId },
            orderBy: { createdAt: "asc" },
            include: {
                compra: {
                    include: {
                        fornecedor: true,
                        ticket: true,
                    },
                },
            },
        });
    }
    static async findUltimoPagamento(compraId) {
        return prisma_1.prisma.pagamento.findFirst({
            where: { compraId },
            orderBy: { createdAt: "desc" },
        });
    }
    static async aggregate(params) {
        return prisma_1.prisma.pagamento.aggregate(params);
    }
    static async calcularTotalPorCompra(compraId) {
        const result = await prisma_1.prisma.pagamento.aggregate({
            where: { compraId },
            _sum: { valorPago: true },
        });
        return Number(result._sum.valorPago || 0);
    }
    static async findPagamentosAnteriores(compraId, dataReferencia) {
        return prisma_1.prisma.pagamento.findMany({
            where: {
                compraId,
                createdAt: { lt: dataReferencia },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    static async findComDetalhesCompletos(pagamentoId) {
        return prisma_1.prisma.pagamento.findUnique({
            where: { id: pagamentoId },
            include: {
                compra: {
                    include: {
                        fornecedor: true,
                        ticket: true,
                        pagamentos: {
                            orderBy: { createdAt: "asc" },
                        },
                    },
                },
            },
        });
    }
}
exports.PagamentoModel = PagamentoModel;
//# sourceMappingURL=pagamento.model.js.map