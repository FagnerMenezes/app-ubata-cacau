import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketTable } from "@/components/tickets/TicketTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFornecedores } from "@/hooks/useFornecedores";
import {
  useConvertTicketToCompra,
  useCreateTicket,
  useDeleteTicket,
  useTickets,
  useUpdateTicket,
} from "@/hooks/useTickets";
import type { CreateTicketInput, Ticket } from "@/types/ticket";
import { Loader2, Package, Plus, Scale, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Hooks para gerenciar dados
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useTickets();
  const { data: fornecedoresData, isLoading: fornecedoresLoading } =
    useFornecedores();

  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();
  const convertTicketMutation = useConvertTicketToCompra();

  const tickets = ticketsData?.data || [];
  const fornecedores = fornecedoresData?.data || [];
  const isLoading = ticketsLoading || fornecedoresLoading;

  const handleCreateTicket = async (data: CreateTicketInput) => {
    try {
      await createTicketMutation.mutateAsync(data);
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
    }
  };

  const handleUpdateTicket = async (id: string, data: CreateTicketInput) => {
    try {
      await updateTicketMutation.mutateAsync({ id, data });
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await deleteTicketMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir ticket:", error);
    }
  };

  const handleConvertTicket = async (
    ticket: Ticket,
    precoPorKg: number,
    observacoes?: string
  ) => {
    try {
      await convertTicketMutation.mutateAsync({
        ticketId: ticket.id,
        compraData: { precoPorKg, observacoes },
      });
      toast.success("Ticket convertido em compra com sucesso!");
    } catch (error) {
      console.error("Erro ao converter ticket:", error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTicket(undefined);
  };

  // Estatísticas
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter((t) => t.status === "PENDENTE").length;
  const convertedTickets = tickets.filter(
    (t) => t.status === "CONVERTIDO"
  ).length;
  const totalWeight = tickets
    .filter((t) => t.status === "PENDENTE")
    .reduce((sum, t) => sum + t.pesoLiquido, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tickets...</span>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar tickets</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tickets - PDV</h1>
          <p className="text-gray-600">Gestão de tickets de pesagem</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Tickets
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Todos os tickets registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Scale className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {convertedTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              Transformados em compras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalWeight || "0.0"} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Peso líquido pendente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketTable
            tickets={tickets}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onConvert={handleConvertTicket}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Formulário */}
      <TicketForm
        open={isFormOpen}
        ticket={selectedTicket}
        fornecedores={fornecedores}
        onClose={handleCloseForm}
        onSave={
          selectedTicket
            ? (data) => handleUpdateTicket(selectedTicket.id, data)
            : handleCreateTicket
        }
      />
    </div>
  );
}
