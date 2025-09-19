import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePagamento } from "@/hooks/usePagamentos";
import { useGeneratePaymentReceiptPDF } from "@/hooks/usePDFGenerator";
import type { MetodoPagamento, Pagamento } from "@/types/pagamento";
import { formatDate } from "date-fns";
import {
  AlertTriangle,
  DollarSign,
  Edit,
  FileText,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

interface PagamentosListProps {
  pagamentos: Pagamento[];
  onEdit?: (pagamento: Pagamento) => void;
  onGenerateRecibo?: (pagamento: Pagamento) => void;
  onDelete?: () => void; // Callback após deletar
  isLoading?: boolean;
}

export function PagamentosList({
  pagamentos,
  onEdit,
  onGenerateRecibo,
  onDelete,
  isLoading = false,
}: PagamentosListProps) {
  const deleteMutation = useDeletePagamento();
  const generatePDFMutation = useGeneratePaymentReceiptPDF();

  const handleDelete = async (pagamento: Pagamento) => {
    if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        await deleteMutation.mutateAsync({
          id: pagamento.id,
          compraId: pagamento.compraId,
        });
        // Chamar callback para atualizar a lista
        onDelete?.();
      } catch (error) {
        console.error("Erro ao deletar pagamento:", error);
      }
    }
  };

  const handleGeneratePDF = async (pagamento: Pagamento) => {
    try {
      await generatePDFMutation.mutateAsync(pagamento.id);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const getMetodoPagamentoBadge = (metodo?: MetodoPagamento) => {
    if (!metodo) return null;

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

  if (isLoading) {
    return (
      <Card className="border-gray-200 border">
        <CardHeader>
          <CardTitle>Carregando pagamentos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pagamentos.length) {
    return (
      <Card className="border-gray-200 border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p>Nenhum pagamento encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-400 border max-h-[500px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pagamentos ({pagamentos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell>
                    {formatDate(
                      new Date(pagamento.createdAt),
                      "dd/MM/yyyy HH:mm"
                    )}
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
                  <TableCell>
                    {pagamento.observacoes ? (
                      <span className="text-sm text-gray-600">
                        {pagamento.observacoes.length > 50
                          ? `${pagamento.observacoes.substring(0, 50)}...`
                          : pagamento.observacoes}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() => handleGeneratePDF(pagamento)}
                          className="text-green-600"
                          disabled={generatePDFMutation.isPending}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar recibo
                        </DropdownMenuItem>
                        {onGenerateRecibo && (
                          <></>
                          // <DropdownMenuItem
                          // onClick={() => handleGeneratePDF(pagamento)}
                          //   className="text-blue-600"
                          // >
                          //   <Receipt className="mr-2 h-4 w-4" />
                          //   Gerar Recibo
                          // </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(pagamento)}
                            className="text-blue-600"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(pagamento)}
                          className="text-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Pago:</span>
            <span className="text-lg font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(
                pagamentos.reduce(
                  (total, pagamento) =>
                    parseFloat(Number(total).toString()) +
                    parseFloat(pagamento.valorPago.toString()),
                  0
                )
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
