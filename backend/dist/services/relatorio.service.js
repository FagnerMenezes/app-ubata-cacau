"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioService = void 0;
const supabase_1 = __importDefault(require("../lib/supabase"));
class RelatorioService {
    static async relatorioCompras(params) {
        const { dataInicio, dataFim, fornecedorId, statusPagamento, page = 1, limit = 50, } = params;
        const skip = (page - 1) * limit;
        try {
            let query = supabase_1.default.from("compras").select(`
          id,
          createdAt,
          valorTotal,
          precoPorKg,
          statusPagamento,
          fornecedor:fornecedores(
            id,
            nome,
            documento
          ),
          ticket:tickets(
            id,
            pesoLiquido
          ),
          pagamentos(id)
        `, { count: "exact" });
            if (fornecedorId) {
                query = query.eq("fornecedorId", fornecedorId);
            }
            if (statusPagamento) {
                query = query.eq("statusPagamento", statusPagamento);
            }
            if (dataInicio) {
                query = query.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                query = query.lte("createdAt", dataFim);
            }
            query = query
                .order("createdAt", { ascending: false })
                .range(skip, skip + limit - 1);
            const { data: compras, error, count } = await query;
            if (error) {
                console.error("Erro ao buscar compras:", error);
                throw new Error("Erro ao buscar compras");
            }
            const totalCompras = count || 0;
            const valorTotal = compras?.reduce((sum, c) => sum + Number(c.valorTotal), 0) || 0;
            const precoMedio = compras?.length > 0
                ? compras.reduce((sum, c) => sum + Number(c.precoPorKg), 0) /
                    compras.length
                : 0;
            return {
                compras: compras?.map((compra) => ({
                    ...compra,
                    valorTotal: Number(compra.valorTotal),
                    precoPorKg: Number(compra.precoPorKg),
                    totalPagamentos: compra.pagamentos?.length || 0,
                })) || [],
                pagination: {
                    page,
                    limit,
                    total: totalCompras,
                    totalPages: Math.ceil(totalCompras / limit),
                },
                resumo: {
                    totalCompras,
                    valorTotal,
                    precoMedio,
                },
            };
        }
        catch (error) {
            console.error("Erro no relatório de compras:", error);
            throw new Error("Erro ao gerar relatório de compras");
        }
    }
    static async relatorioFornecedores(params) {
        const { dataInicio, dataFim, page = 1, limit = 50 } = params;
        const skip = (page - 1) * limit;
        try {
            const { data: fornecedores, error: fornecedoresError, count, } = await supabase_1.default
                .from("fornecedores")
                .select("*", { count: "exact" })
                .order("nome", { ascending: true })
                .range(skip, skip + limit - 1);
            if (fornecedoresError) {
                console.error("Erro ao buscar fornecedores:", fornecedoresError);
                throw new Error("Erro ao buscar fornecedores");
            }
            const fornecedoresProcessados = await Promise.all((fornecedores || []).map(async (fornecedor) => {
                let comprasQuery = supabase_1.default
                    .from("compras")
                    .select(`
              valorTotal,
              ticket:tickets(pesoLiquido),
              pagamentos(id)
            `)
                    .eq("fornecedorId", fornecedor.id);
                if (dataInicio) {
                    comprasQuery = comprasQuery.gte("createdAt", dataInicio);
                }
                if (dataFim) {
                    comprasQuery = comprasQuery.lte("createdAt", dataFim);
                }
                const { data: compras, error: comprasError } = await comprasQuery;
                if (comprasError) {
                    console.error(`Erro ao buscar compras do fornecedor ${fornecedor.id}:`, comprasError);
                    return null;
                }
                let ticketsQuery = supabase_1.default
                    .from("tickets")
                    .select("id")
                    .eq("fornecedorId", fornecedor.id)
                    .eq("status", "PENDENTE");
                if (dataInicio) {
                    ticketsQuery = ticketsQuery.gte("createdAt", dataInicio);
                }
                if (dataFim) {
                    ticketsQuery = ticketsQuery.lte("createdAt", dataFim);
                }
                const { data: tickets, error: ticketsError } = await ticketsQuery;
                if (ticketsError) {
                    console.error(`Erro ao buscar tickets do fornecedor ${fornecedor.id}:`, ticketsError);
                    return null;
                }
                const valorTotalCompras = compras?.reduce((sum, c) => sum + Number(c.valorTotal), 0) || 0;
                const pesoTotal = compras?.reduce((sum, c) => sum + Number(c.ticket?.pesoLiquido || 0), 0) || 0;
                return {
                    id: fornecedor.id,
                    nome: fornecedor.nome,
                    documento: fornecedor.documento,
                    contato: fornecedor.contato,
                    endereco: fornecedor.endereco,
                    saldo: Number(fornecedor.saldo),
                    estatisticas: {
                        totalCompras: compras?.length || 0,
                        valorTotalCompras,
                        pesoTotal,
                        ticketsPendentes: tickets?.length || 0,
                        precoMedio: pesoTotal > 0 ? valorTotalCompras / pesoTotal : 0,
                    },
                };
            }));
            const fornecedoresValidos = fornecedoresProcessados.filter((f) => f !== null);
            const totalFornecedores = fornecedoresValidos.length;
            const totalCompras = fornecedoresValidos.reduce((sum, f) => sum + (f.estatisticas?.totalCompras || 0), 0);
            const valorTotal = fornecedoresValidos.reduce((sum, f) => sum + (f.estatisticas?.valorTotalCompras || 0), 0);
            return {
                fornecedores: fornecedoresValidos,
                resumo: {
                    totalFornecedores,
                    totalCompras,
                    valorTotal,
                },
                paginacao: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                },
            };
        }
        catch (error) {
            console.error("Erro no relatório de fornecedores:", error);
            throw new Error("Erro ao gerar relatório de fornecedores");
        }
    }
    static async dashboard(params) {
        const { dataInicio, dataFim } = params || {};
        try {
            let ticketsQuery = supabase_1.default
                .from("tickets")
                .select("id, status, pesoLiquido", { count: "exact" });
            let comprasQuery = supabase_1.default
                .from("compras")
                .select("valorTotal, precoPorKg, statusPagamento", { count: "exact" });
            let pagamentosQuery = supabase_1.default
                .from("pagamentos")
                .select("valorPago", { count: "exact" });
            if (dataInicio) {
                ticketsQuery = ticketsQuery.gte("createdAt", dataInicio);
                comprasQuery = comprasQuery.gte("createdAt", dataInicio);
                pagamentosQuery = pagamentosQuery.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                ticketsQuery = ticketsQuery.lte("createdAt", dataFim);
                comprasQuery = comprasQuery.lte("createdAt", dataFim);
                pagamentosQuery = pagamentosQuery.lte("createdAt", dataFim);
            }
            const [{ data: fornecedores, error: fornecedoresError }, { data: tickets, error: ticketsError }, { data: compras, error: comprasError }, { data: pagamentos, error: pagamentosError },] = await Promise.all([
                supabase_1.default.from("fornecedores").select("id", { count: "exact" }),
                ticketsQuery,
                comprasQuery,
                pagamentosQuery,
            ]);
            if (fornecedoresError ||
                ticketsError ||
                comprasError ||
                pagamentosError) {
                console.error("Erro ao buscar métricas:", {
                    fornecedoresError,
                    ticketsError,
                    comprasError,
                    pagamentosError,
                });
                throw new Error("Erro ao buscar métricas do dashboard");
            }
            const totalFornecedores = fornecedores?.length || 0;
            const totalTickets = tickets?.length || 0;
            const totalCompras = compras?.length || 0;
            const totalPagamentos = pagamentos?.length || 0;
            const valorTotalCompras = compras?.reduce((sum, c) => sum + Number(c.valorTotal), 0) || 0;
            const valorTotalPago = pagamentos?.reduce((sum, p) => sum + Number(p.valorPago), 0) || 0;
            const precoMedio = compras && compras.length > 0
                ? compras.reduce((sum, c) => sum + Number(c.precoPorKg), 0) / compras.length
                : 0;
            const comprasPorStatus = compras?.reduce((acc, compra) => {
                const status = compra.statusPagamento;
                if (!acc[status]) {
                    acc[status] = { quantidade: 0, valor: 0 };
                }
                acc[status].quantidade += 1;
                acc[status].valor += Number(compra.valorTotal);
                return acc;
            }, {}) || {};
            const ticketsPorStatus = tickets?.reduce((acc, ticket) => {
                const status = ticket.status;
                if (!acc[status]) {
                    acc[status] = { quantidade: 0, peso: 0 };
                }
                acc[status].quantidade += 1;
                acc[status].peso += Number(ticket.pesoLiquido);
                return acc;
            }, {}) || {};
            return {
                metricas: {
                    totalFornecedores,
                    totalTickets,
                    totalCompras,
                    totalPagamentos,
                    valorTotalCompras,
                    valorTotalPago,
                    precoMedio,
                },
                distribuicoes: {
                    comprasPorStatus: Object.entries(comprasPorStatus).map(([status, data]) => ({
                        status,
                        quantidade: data.quantidade,
                        valor: data.valor,
                    })),
                    ticketsPorStatus: Object.entries(ticketsPorStatus).map(([status, data]) => ({
                        status,
                        quantidade: data.quantidade,
                        peso: data.peso,
                    })),
                },
            };
        }
        catch (error) {
            console.error("Erro no dashboard:", error);
            throw new Error("Erro ao gerar dashboard");
        }
    }
    static async relatorioPagamentos(params) {
        const { dataInicio, dataFim, fornecedorId, page = 1, limit = 50 } = params;
        const skip = (page - 1) * limit;
        try {
            let query = supabase_1.default.from("pagamentos").select(`
          id,
          createdAt,
          valorPago,
          metodoPagamento,
          compra:compras(
            id,
            valorTotal,
            fornecedor:fornecedores(
              id,
              nome,
              documento
            )
          )
        `, { count: "exact" });
            if (fornecedorId) {
                query = query.eq("compra.fornecedorId", fornecedorId);
            }
            if (dataInicio) {
                query = query.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                query = query.lte("createdAt", dataFim);
            }
            query = query
                .order("createdAt", { ascending: false })
                .range(skip, skip + limit - 1);
            const { data: pagamentos, error, count } = await query;
            if (error) {
                console.error("Erro ao buscar pagamentos:", error);
                throw new Error("Erro ao buscar pagamentos");
            }
            const totalPagamentos = count || 0;
            const valorTotal = pagamentos?.reduce((sum, p) => sum + Number(p.valorPago), 0) || 0;
            const pagamentosPorMes = pagamentos?.reduce((acc, pagamento) => {
                const mes = new Date(pagamento.createdAt)
                    .toISOString()
                    .substring(0, 7);
                if (!acc[mes]) {
                    acc[mes] = { totalPagamentos: 0, valorTotal: 0 };
                }
                acc[mes].totalPagamentos += 1;
                acc[mes].valorTotal += Number(pagamento.valorPago);
                return acc;
            }, {}) || {};
            const pagamentosPorMesArray = Object.entries(pagamentosPorMes).map(([mes, stats]) => ({
                mes,
                totalPagamentos: stats.totalPagamentos,
                valorTotal: stats.valorTotal,
            }));
            const pagamentosProcessados = (pagamentos || []).map((pagamento) => ({
                id: pagamento.id,
                data: pagamento.createdAt,
                valor: Number(pagamento.valorPago),
                metodo: pagamento.metodoPagamento,
                fornecedor: {
                    nome: pagamento.compra?.fornecedor?.nome || "N/A",
                    documento: pagamento.compra?.fornecedor?.documento || "N/A",
                },
                compra: {
                    id: pagamento.compra?.id || "N/A",
                    valorTotal: Number(pagamento.compra?.valorTotal || 0),
                },
            }));
            return {
                pagamentos: pagamentosProcessados,
                resumo: {
                    totalPagamentos,
                    valorTotal,
                    pagamentosPorMes: pagamentosPorMesArray,
                },
                paginacao: {
                    pagina: page,
                    limite: limit,
                    total: totalPagamentos,
                    totalPaginas: Math.ceil(totalPagamentos / limit),
                },
            };
        }
        catch (error) {
            console.error("Erro no relatório de pagamentos:", error);
            throw error;
        }
    }
    static async relatorioFluxoCaixa(params) {
        const { dataInicio, dataFim, fornecedorId } = params;
        try {
            let comprasQuery = supabase_1.default
                .from("compras")
                .select(`
          id,
          createdAt,
          valorTotal,
          fornecedor:fornecedores(nome),
          ticket:tickets(id)
        `)
                .order("createdAt", { ascending: true });
            if (fornecedorId) {
                comprasQuery = comprasQuery.eq("fornecedorId", fornecedorId);
            }
            if (dataInicio) {
                comprasQuery = comprasQuery.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                comprasQuery = comprasQuery.lte("createdAt", dataFim);
            }
            const { data: compras, error: comprasError } = await comprasQuery;
            if (comprasError) {
                console.error("Erro ao buscar compras:", comprasError);
                throw new Error("Erro ao buscar compras");
            }
            let pagamentosQuery = supabase_1.default
                .from("pagamentos")
                .select(`
          id,
          createdAt,
          valorPago,
          compra:compras(
            fornecedor:fornecedores(nome),
            ticket:tickets(id)
          )
        `)
                .order("createdAt", { ascending: true });
            if (dataInicio) {
                pagamentosQuery = pagamentosQuery.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                pagamentosQuery = pagamentosQuery.lte("createdAt", dataFim);
            }
            if (fornecedorId) {
                pagamentosQuery = pagamentosQuery.eq("compra.fornecedorId", fornecedorId);
            }
            const { data: pagamentos, error: pagamentosError } = await pagamentosQuery;
            if (pagamentosError) {
                console.error("Erro ao buscar pagamentos:", pagamentosError);
                throw new Error("Erro ao buscar pagamentos");
            }
            const eventos = [
                ...(compras || []).map((c) => ({
                    data: new Date(c.createdAt),
                    tipo: "COMPRA",
                    valor: Number(c.valorTotal),
                    descricao: `Compra - Ticket ${Array.isArray(c.ticket) ? c.ticket[0]?.id : c.ticket?.id || "N/A"}`,
                    fornecedor: Array.isArray(c.fornecedor)
                        ? c.fornecedor[0]?.nome
                        : c.fornecedor?.nome || "N/A",
                })),
                ...(pagamentos || []).map((p) => ({
                    data: new Date(p.createdAt),
                    tipo: "PAGAMENTO",
                    valor: Number(p.valorPago),
                    descricao: `Pagamento - Ticket ${Array.isArray(p.compra?.ticket)
                        ? p.compra.ticket[0]?.id
                        : p.compra?.ticket?.id || "N/A"}`,
                    fornecedor: Array.isArray(p.compra?.fornecedor)
                        ? p.compra.fornecedor[0]?.nome
                        : p.compra?.fornecedor?.nome || "N/A",
                })),
            ].sort((a, b) => a.data.getTime() - b.data.getTime());
            let saldoAcumulado = 0;
            const fluxo = eventos.map((evento) => {
                saldoAcumulado +=
                    evento.tipo === "COMPRA" ? evento.valor : -evento.valor;
                return { ...evento, saldoAcumulado };
            });
            const totalCompras = (compras || []).reduce((sum, c) => sum + Number(c.valorTotal), 0);
            const totalPagamentos = (pagamentos || []).reduce((sum, p) => sum + Number(p.valorPago), 0);
            const totais = {
                credito: totalPagamentos,
                debito: totalCompras,
                saldo: totalPagamentos - totalCompras,
            };
            const movimentacoes = fluxo.map((evento) => ({
                data: evento.data.toISOString(),
                historico: evento.descricao,
                credito: evento.tipo === "PAGAMENTO" ? evento.valor : 0,
                debito: evento.tipo === "COMPRA" ? evento.valor : 0,
                saldo: evento.saldoAcumulado,
            }));
            return {
                movimentacoes,
                totais,
                periodo: {
                    inicio: dataInicio || "Início dos registros",
                    fim: dataFim || "Hoje",
                },
            };
        }
        catch (error) {
            console.error("Erro no relatório de fluxo de caixa:", error);
            throw new Error("Erro ao gerar relatório de fluxo de caixa");
        }
    }
    static async relatorioUnificadoFornecedor(params) {
        const { dataInicio, dataFim, fornecedorId } = params;
        try {
            const { data: fornecedor, error: fornecedorError } = await supabase_1.default
                .from("fornecedores")
                .select("*")
                .eq("id", fornecedorId)
                .single();
            if (fornecedorError || !fornecedor) {
                throw new Error("Fornecedor não encontrado");
            }
            let comprasQuery = supabase_1.default
                .from("compras")
                .select(`
          id,
          createdAt,
          valorTotal,
          precoPorKg,
          statusPagamento,
          ticket:tickets(
            id,
            pesoLiquido
          )
        `)
                .eq("fornecedorId", fornecedorId);
            if (dataInicio) {
                comprasQuery = comprasQuery.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                comprasQuery = comprasQuery.lte("createdAt", dataFim);
            }
            const { data: compras, error: comprasError } = await comprasQuery.order("createdAt", { ascending: true });
            if (comprasError) {
                throw new Error("Erro ao buscar compras");
            }
            let pagamentosQuery = supabase_1.default
                .from("pagamentos")
                .select(`
          id,
          createdAt,
          valorPago,
          metodoPagamento,
          compra:compras(
            id,
            valorTotal,
            ticket:tickets(
              id,
              pesoLiquido
            )
          )
        `)
                .eq("compra.fornecedorId", fornecedorId);
            if (dataInicio) {
                pagamentosQuery = pagamentosQuery.gte("createdAt", dataInicio);
            }
            if (dataFim) {
                pagamentosQuery = pagamentosQuery.lte("createdAt", dataFim);
            }
            const { data: pagamentos, error: pagamentosError } = await pagamentosQuery.order("createdAt", { ascending: true });
            if (pagamentosError) {
                throw new Error("Erro ao buscar pagamentos");
            }
            const eventosCacau = [];
            let saldoCacau = 0;
            if (dataInicio) {
                eventosCacau.push({
                    data: new Date(dataInicio),
                    historico: "SALDO ANTERIOR DE CACAU",
                    credito: 0,
                    debito: 0,
                    saldo: 0,
                });
            }
            (compras || []).forEach((compra) => {
                const pesoLiquido = Array.isArray(compra.ticket)
                    ? compra.ticket[0]?.pesoLiquido || 0
                    : compra.ticket?.pesoLiquido || 0;
                if (pesoLiquido > 0) {
                    const valorPorKg = Number(compra.precoPorKg);
                    eventosCacau.push({
                        data: new Date(compra.createdAt),
                        tipo: "RECEBIMENTO",
                        historico: `RECEBIMENTO - Cacau ${pesoLiquido.toFixed(2)} kg - R$ ${valorPorKg.toFixed(2)}/kg`,
                        credito: pesoLiquido,
                        debito: 0,
                        pesoLiquido: pesoLiquido,
                    });
                }
            });
            eventosCacau.sort((a, b) => a.data.getTime() - b.data.getTime());
            const movimentacaoCacau = eventosCacau.map((evento) => {
                if (evento.tipo === "RECEBIMENTO") {
                    saldoCacau += evento.pesoLiquido;
                }
                return {
                    data: evento.data,
                    historico: evento.historico,
                    credito: evento.credito,
                    debito: evento.debito,
                    saldo: saldoCacau,
                };
            });
            const movimentacaoFinanceira = [];
            let saldoFinanceiro = 0;
            if (dataInicio) {
                movimentacaoFinanceira.push({
                    data: new Date(dataInicio),
                    historico: "SALDO FINANCEIRO ANTERIOR",
                    credito: 0,
                    debito: 0,
                    saldo: 0,
                });
            }
            (compras || []).forEach((compra) => {
                saldoFinanceiro -= Number(compra.valorTotal);
                movimentacaoFinanceira.push({
                    data: new Date(compra.createdAt),
                    historico: `DOC N° ${compra.id.substring(0, 8)} ${new Date(compra.createdAt).getFullYear()}-${new Date(compra.createdAt).getFullYear() + 1} FORN. NUMERÁRIO`,
                    credito: 0,
                    debito: Number(compra.valorTotal),
                    saldo: saldoFinanceiro,
                });
            });
            (pagamentos || []).forEach((pagamento) => {
                saldoFinanceiro += Number(pagamento.valorPago);
                movimentacaoFinanceira.push({
                    data: new Date(pagamento.createdAt),
                    historico: `DOC N° ${pagamento.id.substring(0, 8)} ${new Date(pagamento.createdAt).getFullYear()}-${new Date(pagamento.createdAt).getFullYear() + 1} PAGAMENTO`,
                    credito: Number(pagamento.valorPago),
                    debito: 0,
                    saldo: saldoFinanceiro,
                });
            });
            const totalCreditoCacau = movimentacaoCacau.reduce((sum, item) => sum + item.credito, 0);
            const totalDebitoCacau = movimentacaoCacau.reduce((sum, item) => sum + item.debito, 0);
            const totalCreditoFinanceiro = movimentacaoFinanceira.reduce((sum, item) => sum + item.credito, 0);
            const totalDebitoFinanceiro = movimentacaoFinanceira.reduce((sum, item) => sum + item.debito, 0);
            const relatorio = {
                fornecedor: {
                    id: fornecedor.id,
                    nome: fornecedor.nome,
                    documento: fornecedor.documento,
                    endereco: fornecedor.endereco || "RUA DOM EDUARDO - UBATA-BA",
                },
                periodo: {
                    inicio: dataInicio || "01/01/2025",
                    fim: dataFim || new Date().toLocaleDateString("pt-BR"),
                },
                dataEmissao: new Date().toLocaleString("pt-BR"),
                movimentacaoCacau: {
                    movimentacoes: movimentacaoCacau.map((item) => ({
                        data: item.data.toLocaleDateString("pt-BR"),
                        historico: item.historico,
                        credito: item.credito,
                        debito: item.debito,
                        saldo: item.saldo,
                    })),
                    totais: {
                        credito: totalCreditoCacau,
                        debito: totalDebitoCacau,
                        saldo: saldoCacau,
                    },
                },
                movimentacaoFinanceira: {
                    movimentacoes: movimentacaoFinanceira.map((item) => ({
                        data: item.data.toLocaleDateString("pt-BR"),
                        historico: item.historico,
                        credito: item.credito,
                        debito: item.debito,
                        saldo: item.saldo,
                    })),
                    totais: {
                        credito: totalCreditoFinanceiro,
                        debito: totalDebitoFinanceiro,
                        saldo: saldoFinanceiro,
                    },
                },
                resumo: {
                    cacau: {
                        total: saldoCacau,
                        precoMedio: compras && compras.length > 0
                            ? compras.reduce((sum, c) => sum + Number(c.precoPorKg), 0) /
                                compras.length
                            : 0,
                        sacarias: Math.ceil(saldoCacau / 60),
                    },
                    financeiro: {
                        saldo: saldoFinanceiro,
                        totalCompras: totalDebitoFinanceiro,
                        totalPagamentos: totalCreditoFinanceiro,
                    },
                },
            };
            return relatorio;
        }
        catch (error) {
            console.error("Erro no relatório unificado do fornecedor:", error);
            throw new Error("Erro ao gerar relatório unificado do fornecedor");
        }
    }
}
exports.RelatorioService = RelatorioService;
//# sourceMappingURL=relatorio.service.js.map