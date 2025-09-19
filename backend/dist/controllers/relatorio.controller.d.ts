import { Request, Response } from "express";
export declare class RelatorioController {
    private static handleError;
    private static setDownloadHeaders;
    static relatorioCompras(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static relatorioFornecedores(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static relatorioPagamentos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static dashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static fluxoCaixa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static resumoFinanceiro(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static relatorioUnificadoFornecedor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=relatorio.controller.d.ts.map