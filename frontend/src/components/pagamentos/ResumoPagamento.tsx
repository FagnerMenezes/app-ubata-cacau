import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ResumoPagamento as ResumoPagamentoType } from "@/types/pagamento";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  AlertCircle,
} from "lucide-react";

interface ResumoPagamentoProps {
  resumo: ResumoPagamentoType;
  onNovoPagamento: () => void;
}

export function ResumoPagamento({
  resumo,
  onNovoPagamento,
}: ResumoPagamentoProps) {
  const { compra, resumo: stats } = resumo;

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDENTE: "bg-yellow-100 text-yellow-800",
      PARCIAL: "bg-blue-100 text-blue-800",
      PAGO: "bg-green-100 text-green-800",
    };

    const icons = {
      PENDENTE: <Clock className="h-3 w-3" />,
      PARCIAL: <AlertCircle className="h-3 w-3" />,
      PAGO: <CheckCircle className="h-3 w-3" />,
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {icons[status]}
        <span className="ml-1 capitalize">{status.toLowerCase()}</span>
      </Badge>
    );
  };

  const progressPercentage = Math.min(stats.percentualPago, 100);
  const isPaid = stats.percentualPago >= 100;
  const canReceivePayment = stats.saldoRestante > 0;

  return (
    <div className="space-y-6">
      {/* Status da Compra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Status do Pagamento
            </span>
            {getStatusBadge(compra.statusPagamento)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progresso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso do Pagamento</span>
                <span className="font-medium">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-3"
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(compra.valorTotal)}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(stats.valorTotalPago)}
                </div>
                <div className="text-sm text-gray-600">Total Pago</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className={`text-2xl font-bold ${isPaid ? "text-green-600" : "text-orange-600"}`}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(stats.saldoRestante)}
                </div>
                <div className="text-sm text-gray-600">
                  {isPaid ? "Pagamento Concluído" : "Saldo Restante"}
                </div>
              </div>
            </div>

            {/* Informações dos Pagamentos */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">
                    Total de Pagamentos:
                  </span>
                  <span className="ml-2 font-medium">
                    {stats.totalPagamentos}
                  </span>
                </div>
                {canReceivePayment && (
                  <Button
                    onClick={onNovoPagamento}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Pagamento
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas/Avisos */}
      {isPaid && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Pagamento Concluído! Esta compra foi totalmente paga.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalPagamentos === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                Nenhum pagamento foi registrado para esta compra.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}