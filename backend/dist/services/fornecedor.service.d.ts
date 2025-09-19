import { CreateFornecedorInput, FornecedorQuery, UpdateFornecedorInput } from "../types";
export declare class FornecedorService {
    static create(data: CreateFornecedorInput): Promise<any>;
    static findAll(query: FornecedorQuery): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static findById(id: string): Promise<any>;
    static update(id: string, data: UpdateFornecedorInput): Promise<any>;
    static delete(id: string): Promise<void>;
    static getSaldo(id: string): Promise<number>;
    static updateSaldo(id: string, novoSaldo: number): Promise<number>;
}
//# sourceMappingURL=fornecedor.service.d.ts.map