import { Request, Response } from "express";
export declare class CompraController {
    static findAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static findById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static converterTicket(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static obterEstatisticas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static listarPorFornecedor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static calcularStatusPagamento(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=compra.controller.d.ts.map