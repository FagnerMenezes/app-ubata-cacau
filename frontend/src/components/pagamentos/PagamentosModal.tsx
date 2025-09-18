import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagamentosByCompra } from "@/hooks/usePagamentos";
import type { Pagamento } from "@/types/pagamento";
import { useState } from "react";
import { PagamentoForm } from "./PagamentoForm";
import { PagamentosList } from "./PagamentosList";
import { ResumoPagamento } from "./ResumoPagamento";

interface PagamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  compraId: string;
  valorTotalCompra: number;
}

export function PagamentosModal({
  isOpen,
  onClose,
  compraId,
  valorTotalCompra,
}: PagamentosModalProps) {
  const [activeTab, setActiveTab] = useState("resumo");
  const [editingPagamento, setEditingPagamento] = useState<Pagamento | null>(
    null
  );

  const {
    data: resumoPagamentos,
    isLoading,
    refetch,
  } = usePagamentosByCompra(compraId);

  const handleSuccess = () => {
    refetch();
    setEditingPagamento(null);
    setActiveTab("resumo");
  };

  const handleEdit = (pagamento: Pagamento) => {
    setEditingPagamento(pagamento);
    setActiveTab("novo");
  };

  const handleCancelEdit = () => {
    setEditingPagamento(null);
    setActiveTab("resumo");
  };

  const handleGenerateRecibo = (pagamento: Pagamento) => {
    // TODO: Implementar geração de recibo
    console.log("Gerar recibo para:", pagamento);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Gerenciar Pagamentos</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="novo">
              {editingPagamento ? "Editar" : "Novo Pagamento"}
            </TabsTrigger>
            {/* <TabsTrigger value="historico">Histórico</TabsTrigger> */}
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            {resumoPagamentos && (
              <ResumoPagamento
                resumo={resumoPagamentos}
                onNovoPagamento={() => setActiveTab("novo")}
              />
            )}
          </TabsContent>

          <TabsContent value="novo" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <PagamentoForm
                compraId={compraId}
                valorTotalCompra={valorTotalCompra}
                valorJaPago={resumoPagamentos?.resumo.valorTotalPago || 0}
                pagamento={editingPagamento || undefined}
                onSuccess={handleSuccess}
                onCancel={editingPagamento ? handleCancelEdit : undefined}
              />
              {resumoPagamentos && (
                <PagamentosList
                  pagamentos={resumoPagamentos.pagamentos}
                  onEdit={handleEdit}
                  onGenerateRecibo={handleGenerateRecibo}
                  onDelete={refetch}
                />
              )}
            </div>
          </TabsContent>

          {/* <TabsContent value="historico" className="space-y-4">
            {resumoPagamentos && (
              <PagamentosList
                pagamentos={resumoPagamentos.pagamentos}
                onEdit={handleEdit}
                onGenerateRecibo={handleGenerateRecibo}
              />
            )}
          </TabsContent> */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
