import { Request, Response } from "express";
export declare class PagamentoController {
    static findAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static findById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static gerarRecibo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static obterEstatisticas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static listarPorCompra(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static validarPagamento(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=pagamento.controller.d.ts.map