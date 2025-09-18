import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Compra } from "@/types/compra";
import { formatDate } from "date-fns";
import {
  CheckCircle,
  Edit,
  MoreVertical,
  Package,
  Trash2,
  XCircle,
} from "lucide-react";

interface CompraCardProps {
  compras: Compra[];
  onEdit: (compra: Compra) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function CompraCard({
  compras,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: CompraCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "entregue":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "confirmada":
        return "Confirmada";
      case "entregue":
        return "Entregue";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getQualityColor = (qualidade: string) => {
    switch (qualidade) {
      case "superior":
        return "bg-green-100 text-green-800 border-green-200";
      case "boa":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "regular":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inferior":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="grid gap-6">
      {compras?.map((compra) => (
        <Card
          key={compra.id}
          className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.01] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
                      {compra.fornecedor?.nome || "Fornecedor não informado"}
                    </h3>
                    <div className="space-y-1 mt-1">
                      <p className="text-muted-foreground/80 font-medium">
                        Ticket: {compra.ticket?.id?.slice(0, 8) || "N/A"}...
                      </p>
                      {compra.fornecedor?.documento && (
                        <p className="text-sm text-muted-foreground/70">
                          Doc: {compra.fornecedor.documento}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 transition-colors duration-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(compra)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {compra.statusPagamento.toLowerCase() === "pendente" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onApprove(compra.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(compra.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                      {compra.status === "confirmada" && (
                        <DropdownMenuItem onClick={() => onApprove(compra.id)}>
                          <Package className="mr-2 h-4 w-4" />
                          Marcar como Entregue
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(compra.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Data da Compra
                    </p>
                    <p className="font-semibold">
                      {formatDate(compra?.createdAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Quantidade
                    </p>
                    <p className="font-semibold">
                      {Number(compra?.ticket?.pesoLiquido || 0).toFixed(3)} kg
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Preço por Arroba
                    </p>
                    <p className="font-semibold">
                      R$ {Number(compra.precoPorArroba || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Valor Total
                    </p>
                    <p className="font-bold text-lg text-primary">
                      R${" "}
                      {(
                        (Number(compra.ticket?.pesoLiquido || 0) / 15) *
                        Number(compra.precoPorArroba || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Qualidade
                    </p>
                    <Badge
                      variant="outline"
                      className={getQualityColor(
                        (compra?.qualidade || "").toString()
                      )}
                    >
                      {compra?.qualidade || "N/A"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={getStatusColor(
                        compra?.statusPagamento.toLowerCase() || ""
                      )}
                    >
                      {getStatusLabel(
                        compra?.statusPagamento.toLowerCase() || ""
                      )}
                    </Badge>
                  </div>
                </div>

                {compra.observacoes && (
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Observações
                    </p>
                    <p className="text-sm text-muted-foreground/80 bg-muted/30 p-3 rounded-lg">
                      {compra?.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
