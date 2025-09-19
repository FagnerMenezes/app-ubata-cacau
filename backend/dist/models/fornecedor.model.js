"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorModel = void 0;
const prisma_1 = require("../lib/prisma");
class FornecedorModel {
    static async findMany(params) {
        return prisma_1.prisma.fornecedor.findMany(params);
    }
    static async findUnique(params) {
        return prisma_1.prisma.fornecedor.findUnique(params);
    }
    static async create(data) {
        return prisma_1.prisma.fornecedor.create({ data });
    }
    static async update(params) {
        return prisma_1.prisma.fornecedor.update(params);
    }
    static async delete(where) {
        return prisma_1.prisma.fornecedor.delete({ where });
    }
    static async count(where) {
        if (where) {
            return prisma_1.prisma.fornecedor.count({ where });
        }
        return prisma_1.prisma.fornecedor.count();
    }
    static async findByDocumento(documento) {
        return prisma_1.prisma.fornecedor.findUnique({
            where: { documento },
        });
    }
    static async updateSaldo(id, novoSaldo) {
        return prisma_1.prisma.fornecedor.update({
            where: { id },
            data: { saldo: novoSaldo },
        });
    }
    static async aggregate(params) {
        return prisma_1.prisma.fornecedor.aggregate(params);
    }
}
exports.FornecedorModel = FornecedorModel;
//# sourceMappingURL=fornecedor.model.js.map