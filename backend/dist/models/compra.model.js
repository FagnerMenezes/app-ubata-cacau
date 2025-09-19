"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompraModel = void 0;
const prisma_1 = require("../lib/prisma");
class CompraModel {
    static async findMany(params) {
        return prisma_1.prisma.compra.findMany(params);
    }
    static async findUnique(params) {
        return prisma_1.prisma.compra.findUnique(params);
    }
    static async create(data) {
        return prisma_1.prisma.compra.create({
            data,
            include: {
                fornecedor: {
                    select: {
                        id: true,
                        nome: true,
                        documento: true,
                    },
                },
                ticket: {
                    select: {
                        id: true,
                        pesoLiquido: true,
                        pesoBruto: true,
                    },
                },
            },
        });
    }
    static async update(params) {
        return prisma_1.prisma.compra.update(params);
    }
    static async delete(where) {
        return prisma_1.prisma.compra.delete({ where });
    }
    static async count(params) {
        return prisma_1.prisma.compra.count(params);
    }
}
exports.CompraModel = CompraModel;
//# sourceMappingURL=compra.model.js.map