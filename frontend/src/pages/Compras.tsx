import CompraCard from "@/components/compras/CompraCard";
import CompraTable from "@/components/compras/CompraTable";
import { PagamentosModal } from "@/components/pagamentos/PagamentosModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelarCompra,
  useCompras,
  useConfirmarCompra,
  useCreateCompra,
  useDeleteCompra,
  // useMarcarEntregue,
  useUpdateCompra,
} from "@/hooks/useCompras";
import { useAvailableTickets } from "@/hooks/useTickets";
import type { Compra, CreateCompraData } from "@/types/compra";
import {
  Clock,
  DollarSign,
  Grid3X3,
  List,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Compras() {
  const [searchTerm] = useState("");
  const [statusFilter] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState<string | null>(null);
  const [pagamentosModalOpen, setPagamentosModalOpen] = useState(false);
  const [selectedCompraForPayments, setSelectedCompraForPayments] =
    useState<Compra | null>(null);

  // Hooks para gerenciar dados
  const {
    data: comprasData,
    isLoading: comprasLoading,
    error: comprasError,
  } = useCompras({
    search: searchTerm || undefined,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: statusFilter === "todos" ? undefined : (statusFilter as any),
  });
  const { data: ticketsData, isLoading: ticketsLoading } =
    useAvailableTickets();
  console.log(comprasData);
  const createCompraMutation = useCreateCompra();
  const updateCompraMutation = useUpdateCompra();
  const deleteCompraMutation = useDeleteCompra();
  const confirmarCompraMutation = useConfirmarCompra();
  const cancelarCompraMutation = useCancelarCompra();
  //@ts-expect-error err
  const compras = comprasData?.compras || [];
  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : //@ts-expect-error err
      (ticketsData && ticketsData?.data) || [];
  const isLoading = comprasLoading || ticketsLoading;

  // Funções de manipulação
  const handleAddNew = () => {
    // if (tickets.length === 0) {
    //   toast.error("Não há tickets disponíveis para criar uma compra");
    //   return;
    // }
    setSelectedCompra(null);
    setIsFormOpen(true);
  };

  const handleEdit = (compra: Compra) => {
    setSelectedCompra(compra);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompraToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (compraToDelete) {
      try {
        await deleteCompraMutation.mutateAsync(compraToDelete);
        setDeleteConfirmOpen(false);
        setCompraToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir compra:", error);
      }
    }
  };

  const handleSave = async (data: CreateCompraData) => {
    try {
      if (selectedCompra) {
        await updateCompraMutation.mutateAsync({ id: selectedCompra.id, data });
      } else {
        await createCompraMutation.mutateAsync(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompra(null);
  };

  const handleConfirmarCompra = async (id: string) => {
    try {
      await confirmarCompraMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao confirmar compra:", error);
    }
  };

  const handleCancelarCompra = async (id: string, motivo?: string) => {
    try {
      await cancelarCompraMutation.mutateAsync({ id, motivo });
    } catch (error) {
      console.error("Erro ao cancelar compra:", error);
    }
  };

  const handleManagePayments = (compra: Compra) => {
    setSelectedCompraForPayments(compra);
    setPagamentosModalOpen(true);
  };

  const handleClosePaymentsModal = () => {
    setPagamentosModalOpen(false);
    setSelectedCompraForPayments(null);
  };

  const filteredCompras = compras;

  const totalCompras = compras.length;
  const valorTotalMes = compras.reduce(
    (acc: number, compra: Compra) => acc + Number(compra.valorTotal || 0),
    0
  );
  const comprasEntregues = compras.filter(
    (c: Compra) => c.status === "entregue"
  ).length;
  const comprasPendentes = compras.filter(
    (c: Compra) => c?.statusPagamento.toLowerCase() === "pendente"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando compras...</span>
      </div>
    );
  }

  if (comprasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar compras</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background/98 to-muted/20 min-h-screen">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/8 to-primary/5 p-8 border border-border/30 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text ">
              Compras
            </h1>
            <p className="text-muted-foreground/80 text-lg font-medium mt-2">
              Gerencie suas compras de cacau
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Compra
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Total de Compras
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
              {totalCompras}
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2 esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Valor Total (Mês)
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 group-hover:from-emerald-500/30 group-hover:to-emerald-500/20 transition-all duration-300">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
              R$ {(valorTotalMes / 1000).toFixed(0)}k
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-1">
              {new Date().toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Compras Entregues
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-all duration-300">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
              {comprasEntregues}
            </div>
            <p className="text-sm text-blue-600 font-medium mt-1">
              {Math.round((comprasEntregues / totalCompras) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Pendentes
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 group-hover:from-purple-500/30 group-hover:to-purple-500/20 transition-all duration-300">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
              {comprasPendentes}
            </div>
            <p className="text-sm text-purple-600 font-medium mt-1">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar compras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-primary/30 bg-gradient-to-r from-background/80 to-primary/5 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select> */}

            {/* Toggle de visualização */}
            <div className="flex border border-border/50 rounded-lg bg-background/80 backdrop-blur-sm overflow-hidden">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none border-0 px-3 "
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="rounded-none border-0 px-3 "
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de compras */}
      <div className="grid gap-6">
        {filteredCompras.length > 0 ? (
          viewMode === "table" ? (
            <CompraTable
              compras={filteredCompras}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleConfirmarCompra}
              onReject={handleCancelarCompra}
              onManagePayments={handleManagePayments}
            />
          ) : (
            <div className="grid gap-4">
              {filteredCompras?.length > 0 && (
                <CompraCard
                  compras={filteredCompras}
                  onEdit={handleEdit}
                  onApprove={handleConfirmarCompra}
                  onReject={(id) =>
                    handleCancelarCompra(id, "Cancelado pelo usuário")
                  }
                  onDelete={handleDelete}
                />
              )}
            </div>
          )
        ) : (
          <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Nenhuma compra encontrada
              </h3>
              <p className="text-muted-foreground/70 mb-6 text-center max-w-md">
                Não há compras que correspondam aos filtros selecionados.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Compra
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Formulário de Compra */}
      <CompraFormModal
        open={isFormOpen}
        compra={selectedCompra}
        tickets={tickets}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      {/* Modal de Pagamentos */}
      {selectedCompraForPayments && (
        <PagamentosModal
          isOpen={pagamentosModalOpen}
          onClose={handleClosePaymentsModal}
          compraId={selectedCompraForPayments.id}
          valorTotalCompra={selectedCompraForPayments.valorTotal}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta compra? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente para o formulário de compra
interface CompraFormModalProps {
  open: boolean;
  compra?: Compra | null;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickets: any[];
  onClose: () => void;
  onSave: (data: CreateCompraData) => Promise<void>;
}

function CompraFormModal({
  open,
  compra,
  tickets,
  onClose,
  onSave,
}: CompraFormModalProps) {
  const [formData, setFormData] = useState<CreateCompraData>({
    ticketId: "",
    precoPorArroba: 0,
    qualidade: 8,
    observacoes: "",
  });

  // Atualizar formData quando compra muda
  React.useEffect(() => {
    if (compra && open) {
      setFormData({
        ticketId: compra.ticketId || "",
        precoPorArroba: Number(compra.precoPorArroba) || 0,
        qualidade: compra.qualidade || 8,
        observacoes: compra.observacoes || "",
      });
    } else if (!compra && open) {
      setFormData({
        ticketId: "",
        precoPorArroba: 0,
        qualidade: 8,
        observacoes: "",
      });
    }
  }, [compra, open]);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pesoMinimo, setPesoMinimo] = useState("");
  const [pesoMaximo, setPesoMaximo] = useState("");

  // Se estamos editando, usar dados da compra; senão buscar no tickets disponíveis
  const selectedTicket =
    compra?.ticket ||
    (Array.isArray(tickets)
      ? tickets.find((t) => t.id === formData.ticketId)
      : undefined);
  const precoPorKg = formData.precoPorArroba / 15; // 1 arroba = 15 kg
  const valorTotal = selectedTicket
    ? Number(selectedTicket.pesoLiquido) * precoPorKg
    : 0;

  // Filtrar tickets baseado no texto de busca e status
  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter((ticket) => {
        const matchesText =
          ticket.fornecedor?.nome
            .toLowerCase()
            .includes(ticketFilter.toLowerCase()) ||
          ticket.id.toLowerCase().includes(ticketFilter.toLowerCase()) ||
          ticket.fornecedor?.documento
            ?.toLowerCase()
            .includes(ticketFilter.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || ticket.status === statusFilter;

        // Filtro por peso
        const peso = Number(ticket.pesoLiquido);
        const matchesPesoMin = !pesoMinimo || peso >= Number(pesoMinimo);
        const matchesPesoMax = !pesoMaximo || peso <= Number(pesoMaximo);

        return matchesText && matchesStatus && matchesPesoMin && matchesPesoMax;
      })
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ticketId || formData.precoPorArroba <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      setFormData({
        ticketId: "",
        precoPorArroba: 0,
        qualidade: 8,
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white max-h-[calc(100vh-100px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {compra ? "Editar Compra" : "Nova Compra"}
            </DialogTitle>
            <DialogDescription>
              {compra
                ? "Edite os dados da compra"
                : "Selecione um ticket e defina o preço para criar uma nova compra"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Filtros para tickets - apenas no modo de criação */}
            {!compra && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">
                  Filtros de Tickets
                </Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por fornecedor, ID ou documento..."
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtros por peso */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">
                      Peso Mínimo (kg)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 100"
                      value={pesoMinimo}
                      onChange={(e) => setPesoMinimo(e.target.value)}
                      className="text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">
                      Peso Máximo (kg)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 1000"
                      value={pesoMaximo}
                      onChange={(e) => setPesoMaximo(e.target.value)}
                      className="text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTicketFilter("");
                      setStatusFilter("ALL");
                      setPesoMinimo("");
                      setPesoMaximo("");
                    }}
                    className="mt-5"
                  >
                    Limpar
                  </Button>
                </div>

                {filteredTickets.length === 0 &&
                  (ticketFilter ||
                    statusFilter !== "ALL" ||
                    pesoMinimo ||
                    pesoMaximo) && (
                    <p className="text-sm text-gray-500">
                      Nenhum ticket encontrado com os filtros aplicados.
                    </p>
                  )}

                <div className="text-xs text-gray-500">
                  {filteredTickets.length} de {tickets.length} tickets
                  encontrados
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticketId">Ticket *</Label>
              {compra ? (
                // Modo de edição - mostrar informações do ticket
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {compra.fornecedor?.nome || "Fornecedor não informado"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Peso:{" "}
                        {Number(compra.ticket?.pesoLiquido || 0).toFixed(3)}kg
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {compra.ticket?.id?.slice(0, 8)}...
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Convertido
                    </span>
                  </div>
                </div>
              ) : (
                // Modo de criação - seletor de ticket
                <Select
                  value={formData.ticketId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, ticketId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ticket" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {filteredTickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {ticket.fornecedor?.nome} -{" "}
                            {Number(ticket.pesoLiquido).toFixed(3)}kg
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {ticket.id.slice(0, 8)}... | Status:{" "}
                            {ticket.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Primeira linha */}
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Número do Ticket</Label>
                <Input
                  id="ticketNumber"
                  type="text"
                  value={selectedTicket?.id?.slice(0, 8) || ""}
                  disabled
                  className="bg-gray-50 text-gray-600"
                  placeholder="Selecione um ticket"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoPorKg">Preço por Kg (R$)</Label>
                <Input
                  id="precoPorKg"
                  type="text"
                  value={
                    precoPorKg > 0 ? `R$ ${precoPorKg.toFixed(2)}` : "R$ 0,00"
                  }
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Segunda linha */}
              <div className="space-y-2">
                <Label htmlFor="precoPorArroba">Preço por Arroba (R$) *</Label>
                <Input
                  id="precoPorArroba"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoPorArroba}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      precoPorArroba: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualidade">Qualidade (1-10) *</Label>
                <Input
                  id="qualidade"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.qualidade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      qualidade: parseInt(e.target.value) || 8,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                placeholder="Observações sobre a compra..."
                rows={3}
              />
            </div>

            {selectedTicket && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Detalhes do Ticket Selecionado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm">
                      <strong>Fornecedor:</strong>{" "}
                      {selectedTicket.fornecedor?.nome || "N/A"}
                    </p>
                    {selectedTicket.fornecedor?.documento && (
                      <p className="text-sm text-gray-600">
                        <strong>Documento:</strong>{" "}
                        {selectedTicket.fornecedor.documento}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>Status do Ticket:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedTicket.status === "PENDENTE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <strong>Peso Bruto:</strong>{" "}
                      {Number(selectedTicket.pesoBruto || 0).toFixed(3)} kg
                    </p>
                    <p className="text-sm">
                      <strong>Peso Líquido:</strong>{" "}
                      {Number(selectedTicket.pesoLiquido).toFixed(3)} kg
                    </p>
                    {formData.precoPorArroba > 0 && (
                      <>
                        <p className="text-sm">
                          <strong>Preço por kg:</strong> R${" "}
                          {precoPorKg.toFixed(2)}
                        </p>
                        <p className="text-sm font-bold text-blue-800">
                          <strong>Valor total:</strong> R${" "}
                          {valorTotal.toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {selectedTicket.observacoes && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm">
                      <strong>Observações do Ticket:</strong>{" "}
                      {selectedTicket.observacoes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading || !formData.ticketId || formData.precoPorArroba <= 0
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : compra ? (
                "Atualizar"
              ) : (
                "Criar Compra"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
