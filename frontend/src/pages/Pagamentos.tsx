import { PagamentosModal } from "@/components/pagamentos/PagamentosModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagamentos } from "@/hooks/usePagamentos";
import type {
  MetodoPagamento,
  Pagamento,
  PagamentoFilters,
} from "@/types/pagamento";
import { formatDate } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function PagamentosPage() {
  const [filters, setFilters] = useState<PagamentoFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedCompra, setSelectedCompra] = useState<{
    compraId: string;
    valorTotal: number;
  } | null>(null);

  const { data: pagamentosData, isLoading } = usePagamentos(filters);

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof PagamentoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getMetodoPagamentoBadge = (metodo?: MetodoPagamento) => {
    if (!metodo) return <span className="text-gray-400">—</span>;

    const colors = {
      DINHEIRO: "bg-green-100 text-green-800",
      PIX: "bg-blue-100 text-blue-800",
      TRANSFERENCIA: "bg-purple-100 text-purple-800",
      CHEQUE: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={colors[metodo] || "bg-gray-100 text-gray-800"}>
        {metodo}
      </Badge>
    );
  };

  const handleViewCompra = (compraId: string, valorTotal: number) => {
    setSelectedCompra({ compraId, valorTotal });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fornecedor..."
                value={filters.fornecedorId || ""}
                onChange={(e) =>
                  handleFilterChange("fornecedorId", e.target.value)
                }
                className="pl-8"
              />
            </div>

            <Select
              value={filters.metodoPagamento || ""}
              onValueChange={(value) =>
                handleFilterChange("metodoPagamento", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Método de pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos os métodos</SelectItem>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={filters.dataInicio || ""}
              onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
            />

            <Input
              type="date"
              placeholder="Data fim"
              value={filters.dataFim || ""}
              onChange={(e) => handleFilterChange("dataFim", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lista de Pagamentos
            {pagamentosData && (
              <Badge variant="secondary">
                {pagamentosData.pagination.total} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : //@ts-expect-error err
          !pagamentosData?.pagamentos?.length ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pagamento encontrado
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Compra ID</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* @ts-expect-error err */}
                    {pagamentosData?.pagamentos?.map((pagamento: Pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell>
                          {formatDate(
                            new Date(pagamento.createdAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          {pagamento.compra?.fornecedor?.nome || "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(pagamento.valorPago)}
                        </TableCell>
                        <TableCell>
                          {getMetodoPagamentoBadge(pagamento.metodoPagamento)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {pagamento.compraId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewCompra(
                                pagamento.compraId,
                                pagamento.compra?.valorTotal || 0
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagamentosData.pagination && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagamentosData.pagination.page} de{" "}
                    {pagamentosData.pagination.totalPages} (
                    {pagamentosData.pagination.total} total)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagamentosData.pagination.page - 1)
                      }
                      disabled={pagamentosData.pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagamentosData.pagination.page + 1)
                      }
                      disabled={
                        pagamentosData.pagination.page >=
                        pagamentosData.pagination.totalPages
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pagamentos */}
      {selectedCompra && (
        <PagamentosModal
          isOpen={!!selectedCompra}
          onClose={() => setSelectedCompra(null)}
          compraId={selectedCompra.compraId}
          valorTotalCompra={selectedCompra.valorTotal}
        />
      )}
    </div>
  );
}
