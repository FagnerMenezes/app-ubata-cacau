import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateUnifiedSupplierReportPDF } from "@/hooks/usePDFGenerator";
import { useRelatorioUnificadoFornecedor } from "@/hooks/useRelatorios";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

interface RelatorioUnificadoFornecedorProps {
  fornecedorId: string;
  dataInicio?: string;
  dataFim?: string;
}

export function RelatorioUnificadoFornecedor({
  fornecedorId,
  dataInicio,
  dataFim,
}: RelatorioUnificadoFornecedorProps) {
  const {
    data: relatorio,
    isLoading,
    error,
  } = useRelatorioUnificadoFornecedor({
    fornecedorId,
    dataInicio,
    dataFim,
  });

  const generatePDF = useGenerateUnifiedSupplierReportPDF();

  const handleExportarPDF = () => {
    if (relatorio) {
      generatePDF.mutate(relatorio);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erro ao carregar relatório unificado
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatorio) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            Nenhum dado encontrado para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">UBATA CACAU</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {typeof relatorio.fornecedor.endereco === "string"
                  ? relatorio.fornecedor.endereco
                  : `${relatorio.fornecedor.endereco?.rua || ""}, ${
                      relatorio.fornecedor.endereco?.cidade || ""
                    } - ${relatorio.fornecedor.endereco?.estado || ""}`}
              </p>
              <p className="text-sm text-gray-600">
                Emitido em: {String(relatorio.dataEmissao || "")}
              </p>
            </div>
            <Button
              onClick={handleExportarPDF}
              disabled={generatePDF.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-lg">
                {String(relatorio.fornecedor.nome || "")}
              </h3>
              <p className="text-sm text-gray-600">
                {String(relatorio.fornecedor.documento || "")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Período:</p>
              <p className="font-medium">
                {String(relatorio.periodo.inicio || "")} a{" "}
                {String(relatorio.periodo.fim || "")}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                <FileText className="w-3 h-3 mr-1" />
                Relatório Unificado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumo Cacau */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Cacau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total em estoque:</span>
                <span className="font-medium">
                  {relatorio.resumo.cacau.total.toFixed(2)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Preço médio:</span>
                <span className="font-medium">
                  {formatCurrency(relatorio.resumo.cacau.precoMedio)}/kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sacarias:</span>
                <span className="font-medium">
                  {relatorio.resumo.cacau.sacarias} unidades
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Saldo atual:</span>
                <span
                  className={`font-medium ${
                    relatorio.resumo.financeiro.saldo >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(relatorio.resumo.financeiro.saldo)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total compras:</span>
                <span className="font-medium">
                  {formatCurrency(relatorio.resumo.financeiro.totalCompras)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total pagamentos:</span>
                <span className="font-medium">
                  {formatCurrency(relatorio.resumo.financeiro.totalPagamentos)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimentação de Cacau */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MOVIMENTO DE CACAU</CardTitle>
          <p className="text-sm text-gray-600">
            Período: {relatorio.periodo.inicio} a {relatorio.periodo.fim}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Data
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Histórico
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Crédito
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Débito
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {relatorio.movimentacaoCacau.movimentacoes.map((mov, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {String(mov.data || "")}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {String(mov.historico || "")}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {mov.credito > 0 ? `${mov.credito.toFixed(2)} kg` : "-"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {mov.debito > 0 ? `${mov.debito.toFixed(2)} kg` : "-"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                      {mov.saldo.toFixed(2)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-200 px-4 py-2" colSpan={2}>
                    Totais
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {relatorio.movimentacaoCacau.totais.credito.toFixed(2)} kg
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {relatorio.movimentacaoCacau.totais.debito.toFixed(2)} kg
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {relatorio.movimentacaoCacau.totais.saldo.toFixed(2)} kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Movimentação Financeira */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MOVIMENTO FINANCEIRO</CardTitle>
          <p className="text-sm text-gray-600">
            Período: {relatorio.periodo.inicio} a {relatorio.periodo.fim}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Data
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Histórico
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Crédito
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Débito
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {relatorio.movimentacaoFinanceira.movimentacoes.map(
                  (mov, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        {String(mov.data || "")}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {String(mov.historico || "")}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {mov.credito > 0 ? formatCurrency(mov.credito) : "-"}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {mov.debito > 0 ? formatCurrency(mov.debito) : "-"}
                      </td>
                      <td
                        className={`border border-gray-200 px-4 py-2 text-right font-medium ${
                          mov.saldo >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(mov.saldo)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-200 px-4 py-2" colSpan={2}>
                    Totais
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {formatCurrency(
                      relatorio.movimentacaoFinanceira.totais.credito
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {formatCurrency(
                      relatorio.movimentacaoFinanceira.totais.debito
                    )}
                  </td>
                  <td
                    className={`border border-gray-200 px-4 py-2 text-right ${
                      relatorio.movimentacaoFinanceira.totais.saldo >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      relatorio.movimentacaoFinanceira.totais.saldo
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
