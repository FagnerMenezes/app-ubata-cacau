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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { printTicket } from "@/lib/print";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { Edit, MoreHorizontal, Printer, Search, Trash2 } from "lucide-react";
import { useState } from "react";

interface TicketTableProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => Promise<void>;
  onConvert: (
    ticket: Ticket,
    precoPorKg: number,
    observacoes?: string
  ) => Promise<void>;
  loading?: boolean;
}

export function TicketTable({
  tickets,
  onEdit,
  onDelete,
  onConvert,
  loading = false,
}: TicketTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [ticketToConvert, setTicketToConvert] = useState<Ticket | null>(null);
  const [precoPorKg, setPrecoPorKg] = useState<number>(0);
  const [observacoesConversao, setObservacoesConversao] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.fornecedor?.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ticket.fornecedor?.documento
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "PENDENTE":
        return <Badge variant="secondary">Pendente</Badge>;
      case "CONVERTIDO":
        return <Badge variant="default">Convertido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWeight = (weight: number) => {
    return `${weight} kg`;
  };

  const handleDeleteClick = (id: string) => {
    setTicketToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await onDelete(ticketToDelete);
        setDeleteConfirmOpen(false);
        setTicketToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir ticket:", error);
      }
    }
  };

  // const handleConvertClick = (ticket: Ticket) => {
  //   setTicketToConvert(ticket);
  //   setPrecoPorKg(0);
  //   setObservacoesConversao("");
  //   setConvertDialogOpen(true);
  // };

  const confirmConvert = async () => {
    if (ticketToConvert && precoPorKg > 0) {
      try {
        await onConvert(ticketToConvert, precoPorKg, observacoesConversao);
        setConvertDialogOpen(false);
        setTicketToConvert(null);
        setPrecoPorKg(0);
        setObservacoesConversao("");
      } catch (error) {
        console.error("Erro ao converter ticket:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por fornecedor, documento ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as TicketStatus | "ALL")
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Todos os status</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="CONVERTIDO">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Peso Bruto</TableHead>
              <TableHead>Peso Líquido</TableHead>
              <TableHead>Diferença</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  {tickets.length === 0
                    ? "Nenhum ticket encontrado"
                    : "Nenhum ticket corresponde aos filtros aplicados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">
                    {ticket.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.fornecedor?.nome}</p>
                      <p className="text-sm text-gray-600">
                        {ticket.fornecedor?.documento}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatWeight(ticket.pesoBruto)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatWeight(ticket.pesoLiquido)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatWeight(ticket.pesoBruto - ticket.pesoLiquido)}
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(ticket.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() =>
                            printTicket(ticket, {
                              useThermalAPI: true,
                              autoprint: true,
                            })
                          }
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Ticket (Térmica)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            printTicket(ticket, { autoprint: true })
                          }
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Ticket (Tradicional)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(ticket)}
                          disabled={ticket.status === "CONVERTIDO"}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {/* {ticket.status === "PENDENTE" && (
                          <DropdownMenuItem
                            onClick={() => handleConvertClick(ticket)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Converter em Compra
                          </DropdownMenuItem>
                        )} */}
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(ticket.id)}
                          disabled={ticket.status === "CONVERTIDO"}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumo */}
      {filteredTickets.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span>
            Mostrando {filteredTickets.length} de {tickets.length} tickets
          </span>
          <div className="flex gap-4">
            <span>
              Pendentes: {tickets.filter((t) => t.status === "PENDENTE").length}
            </span>
            <span>
              Convertidos:{" "}
              {tickets.filter((t) => t.status === "CONVERTIDO").length}
            </span>
          </div>
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ticket? Esta ação não pode ser
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

      {/* Dialog de conversão de ticket */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Converter Ticket em Compra</DialogTitle>
            <DialogDescription>
              {ticketToConvert && (
                <>
                  Convertendo ticket de {ticketToConvert.fornecedor?.nome}
                  <br />
                  Peso líquido: {formatWeight(ticketToConvert.pesoLiquido)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="precoPorKg">Preço por Kg (R$)</Label>
              <Input
                id="precoPorKg"
                type="number"
                step="0.01"
                min="0"
                value={precoPorKg}
                onChange={(e) => setPrecoPorKg(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Input
                id="observacoes"
                value={observacoesConversao}
                onChange={(e) => setObservacoesConversao(e.target.value)}
                placeholder="Observações sobre a compra..."
              />
            </div>
            {ticketToConvert && precoPorKg > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Valor total: R${" "}
                  {(Number(ticketToConvert.pesoLiquido) * precoPorKg).toFixed(
                    2
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmConvert} disabled={precoPorKg <= 0}>
              Converter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
