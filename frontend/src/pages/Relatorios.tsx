import { RelatorioUnificadoFornecedor } from "@/components/RelatorioUnificadoFornecedor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFornecedores } from "@/hooks/useFornecedores";
import { useGenerateFinancialReportPDF } from "@/hooks/usePDFGenerator";
import {
  useExportarCSV,
  useExportarPDF,
  useFluxoCaixa,
  useRelatorioCompras,
  useRelatorioFornecedores,
  useRelatorioPagamentos,
  useResumoFinanceiro,
} from "@/hooks/useRelatorios";
import type { RelatorioFilters } from "@/services/relatorios";
import { formatDate } from "date-fns";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Filter,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function RelatoriosPage() {
  const [filters, setFilters] = useState<RelatorioFilters>({
    dataInicio: undefined,
    dataFim: undefined,
    fornecedorId: undefined,
    statusPagamento: undefined,
    agrupamento: "mes",
  });

  const [activeTab, setActiveTab] = useState("resumo");
  const [pagamentosPage, setPagamentosPage] = useState(1);
  const [pagamentosLimit] = useState(10);

  // Hooks para relatórios
  const { data: resumoFinanceiro, isLoading: loadingResumo } =
    useResumoFinanceiro(filters);
  const { data: relatorioCompras, isLoading: loadingCompras } =
    useRelatorioCompras(filters);
  const { data: relatorioFornecedores, isLoading: loadingFornecedores } =
    useRelatorioFornecedores(filters);
  const { data: relatorioPagamentos, isLoading: loadingPagamentos } =
    useRelatorioPagamentos({
      ...filters,
      page: pagamentosPage,
      limit: pagamentosLimit,
    });
  const { data: fluxoCaixa, isLoading: loadingFluxoCaixa } =
    useFluxoCaixa(filters);

  // Hooks para fornecedores (para o filtro)
  const { data: fornecedoresData } = useFornecedores();

  // Hooks para exportação
  const exportarCSVMutation = useExportarCSV();
  const exportarPDFMutation = useExportarPDF();
  const generateFinancialPDFMutation = useGenerateFinancialReportPDF();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleExport = (tipo: string, formato: "csv" | "pdf") => {
    if (formato === "csv") {
      exportarCSVMutation.mutate({ tipo, filters });
    } else {
      // Usar o gerador de PDF local para relatórios financeiros
      if (tipo === "resumo-financeiro" && resumoFinanceiro) {
        generateFinancialPDFMutation.mutate({
          tipo: "resumo-financeiro",
          titulo: "Resumo Financeiro",
          periodo: {
            inicio: filters.dataInicio || "Início dos registros",
            fim: filters.dataFim || "Hoje",
          },
          metricas: resumoFinanceiro.metricas,
          dados: [],
          resumo: resumoFinanceiro.metricas,
        });
      } else if (tipo === "compras" && relatorioCompras) {
        generateFinancialPDFMutation.mutate({
          tipo: "compras",
          titulo: "Relatório de Compras",
          periodo: {
            inicio: filters.dataInicio || "Início dos registros",
            fim: filters.dataFim || "Hoje",
          },
          metricas: relatorioCompras.resumo,
          dados: relatorioCompras.compras,
        });
      } else if (tipo === "fornecedores" && relatorioFornecedores) {
        generateFinancialPDFMutation.mutate({
          tipo: "fornecedores",
          titulo: "Relatório de Fornecedores",
          periodo: {
            inicio: filters.dataInicio || "Início dos registros",
            fim: filters.dataFim || "Hoje",
          },
          metricas: relatorioFornecedores.resumo,
          dados: relatorioFornecedores.fornecedores,
        });
      } else if (tipo === "pagamentos" && relatorioPagamentos) {
        generateFinancialPDFMutation.mutate({
          tipo: "pagamentos",
          titulo: "Relatório de Pagamentos",
          periodo: {
            inicio: filters.dataInicio || "Início dos registros",
            fim: filters.dataFim || "Hoje",
          },
          metricas: relatorioPagamentos.resumo,
          dados: relatorioPagamentos.pagamentos,
        });
      } else if (tipo === "fluxo-caixa" && fluxoCaixa) {
        generateFinancialPDFMutation.mutate({
          tipo: "fluxo-caixa",
          titulo: "Fluxo de Caixa",
          periodo: fluxoCaixa.periodo,
          metricas: fluxoCaixa.totais,
          dados: fluxoCaixa.movimentacoes,
        });
      } else {
        // Fallback para exportação via API
        exportarPDFMutation.mutate({ tipo, filters });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDateSafe = (
    dateString: string | undefined,
    format: string = "dd/MM/yyyy"
  ) => {
    if (!dateString) return "Data inválida";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";

    return formatDate(date, format);
  };

  const formatDateRange = () => {
    if (filters.dataInicio && filters.dataFim) {
      return `${formatDateSafe(filters.dataInicio)} - ${formatDateSafe(
        filters.dataFim
      )}`;
    }
    return "Período não selecionado";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-gray-600">
            Análise completa da movimentação financeira
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDateRange()}</span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filters.dataInicio || ""}
                onChange={(e) =>
                  handleFilterChange("dataInicio", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filters.dataFim || ""}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Select
                value={filters.fornecedorId || ""}
                onValueChange={(value) =>
                  handleFilterChange("fornecedorId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="todos">Todos os fornecedores</SelectItem>
                  {fornecedoresData?.data?.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status Pagamento</Label>
              <Select
                value={filters.statusPagamento || ""}
                onValueChange={(value) =>
                  handleFilterChange("statusPagamento", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="PARCIAL">Parcial</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agrupamento">Agrupamento</Label>
              <Select
                value={filters.agrupamento || "mes"}
                onValueChange={(value) =>
                  handleFilterChange("agrupamento", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="dia">Por Dia</SelectItem>
                  <SelectItem value="semana">Por Semana</SelectItem>
                  <SelectItem value="mes">Por Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="unificado">Unificado</TabsTrigger>
        </TabsList>

        {/* Resumo Financeiro */}
        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("resumo-financeiro", "csv")}
                  disabled={exportarCSVMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("resumo-financeiro", "pdf")}
                  disabled={exportarPDFMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingResumo ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Carregando resumo...</div>
                </div>
              ) : resumoFinanceiro?.metricas ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        resumoFinanceiro.metricas.valorTotalCompras || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Compras</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        resumoFinanceiro.metricas.valorTotalPago || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Pago</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">
                      {resumoFinanceiro.metricas.totalFornecedores || 0}
                    </div>
                    <div className="text-sm text-gray-600">Fornecedores</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {resumoFinanceiro.metricas.totalCompras || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Compras</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Compras */}
        <TabsContent value="compras" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Relatório de Compras</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("compras", "csv")}
                  disabled={exportarCSVMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("compras", "pdf")}
                  disabled={exportarPDFMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCompras ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Carregando compras...</div>
                </div>
              ) : relatorioCompras?.resumo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {relatorioCompras.resumo.totalCompras || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total de Compras
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          relatorioCompras.resumo.valorTotal || 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          relatorioCompras.resumo.precoMedio || 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Preço Médio/Kg
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {relatorioCompras.compras?.map((compra) => (
                      <div
                        key={compra.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {compra.fornecedor.nome}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDateSafe(compra.data)} - Ticket:{" "}
                            {compra.ticket.id} -{compra.ticket.pesoLiquido}kg
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(compra.valorTotal)}
                          </div>
                          <Badge
                            variant={
                              compra.statusPagamento === "PAGO"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {compra.statusPagamento}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma compra encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Fornecedores */}
        <TabsContent value="fornecedores" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Relatório de Fornecedores</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("fornecedores", "csv")}
                  disabled={exportarCSVMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("fornecedores", "pdf")}
                  disabled={exportarPDFMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingFornecedores ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">
                    Carregando fornecedores...
                  </div>
                </div>
              ) : relatorioFornecedores?.resumo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {relatorioFornecedores.resumo.totalFornecedores || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Fornecedores
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {relatorioFornecedores.resumo.totalCompras || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Compras</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          relatorioFornecedores.resumo.valorTotal || 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {relatorioFornecedores.fornecedores?.map((fornecedor) => (
                      <div
                        key={fornecedor.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{fornecedor.nome}</div>
                          <div className="text-sm text-gray-600">
                            {fornecedor.documento}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(
                              fornecedor.estatisticas?.valorTotalCompras || 0
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {fornecedor.estatisticas?.totalCompras || 0} compras
                            -
                            {formatCurrency(
                              fornecedor.estatisticas?.precoMedio || 0
                            )}
                            /kg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum fornecedor encontrado para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Pagamentos */}
        <TabsContent value="pagamentos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Relatório de Pagamentos</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pagamentos", "csv")}
                  disabled={exportarCSVMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pagamentos", "pdf")}
                  disabled={exportarPDFMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPagamentos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Carregando pagamentos...</div>
                </div>
              ) : relatorioPagamentos?.resumo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {relatorioPagamentos.resumo.totalPagamentos || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Pagamentos
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          relatorioPagamentos.resumo.valorTotal || 0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">
                            Fornecedor
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left">
                            Data
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left">
                            Método
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-right">
                            Valor
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left">
                            Compra
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorioPagamentos.pagamentos?.map((pagamento) => (
                          <tr key={pagamento.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="font-medium">
                                {pagamento.fornecedor?.nome || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {pagamento.fornecedor?.documento || ""}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {formatDateSafe(pagamento.data)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {pagamento.metodo || "N/A"}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                              {formatCurrency(pagamento.valor || 0)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="text-sm text-gray-600">
                                {pagamento.compra?.id
                                  ? pagamento.compra.id.substring(0, 8) + "..."
                                  : "N/A"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {relatorioPagamentos.paginacao && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Mostrando {(pagamentosPage - 1) * pagamentosLimit + 1} a{" "}
                        {Math.min(
                          pagamentosPage * pagamentosLimit,
                          relatorioPagamentos.paginacao.total
                        )}{" "}
                        de {relatorioPagamentos.paginacao.total} pagamentos
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPagamentosPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={pagamentosPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="px-3 py-1 text-sm">
                          Página {pagamentosPage} de{" "}
                          {relatorioPagamentos.paginacao.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagamentosPage((prev) => prev + 1)}
                          disabled={
                            pagamentosPage >=
                            relatorioPagamentos.paginacao.totalPages
                          }
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pagamento encontrado para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Fluxo de Caixa */}
        <TabsContent value="fluxo-caixa" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fluxo de Caixa</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("fluxo-caixa", "csv")}
                  disabled={exportarCSVMutation?.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("fluxo-caixa", "pdf")}
                  disabled={exportarPDFMutation?.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingFluxoCaixa ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">
                    Carregando fluxo de caixa...
                  </div>
                </div>
              ) : fluxoCaixa?.totais ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(fluxoCaixa?.totais?.credito || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Créditos
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(fluxoCaixa?.totais?.debito || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Débitos</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(fluxoCaixa?.totais?.saldo || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Saldo Final</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fluxoCaixa?.movimentacoes?.map((mov, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{mov?.historico}</div>
                          <div className="text-sm text-gray-600">
                            {formatDateSafe(mov.data)}
                          </div>
                        </div>
                        <div className="text-right">
                          {mov?.credito > 0 && (
                            <div className="text-green-600 font-medium">
                              +{formatCurrency(mov?.credito)}
                            </div>
                          )}
                          {mov?.debito > 0 && (
                            <div className="text-red-600 font-medium">
                              -{formatCurrency(mov?.debito)}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Saldo: {formatCurrency(mov?.saldo)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma movimentação encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório Unificado do Fornecedor */}
        <TabsContent value="unificado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Unificado do Fornecedor
              </CardTitle>
              <p className="text-sm text-gray-600">
                Visualize todo o fluxo do fornecedor: compras, pagamentos e
                saldos em um único relatório
              </p>
            </CardHeader>
            <CardContent>
              {filters.fornecedorId ? (
                <RelatorioUnificadoFornecedor
                  fornecedorId={filters.fornecedorId}
                  dataInicio={filters.dataInicio}
                  dataFim={filters.dataFim}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Selecione um fornecedor
                  </p>
                  <p className="text-sm">
                    Escolha um fornecedor no filtro acima para visualizar o
                    relatório unificado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
