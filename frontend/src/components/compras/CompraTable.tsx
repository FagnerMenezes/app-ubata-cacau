import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Compra } from "@/types/compra";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Edit,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Trash2,
  XCircle,
  DollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";

interface CompraTableProps {
  compras: Compra[];
  onEdit: (compra: Compra) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onManagePayments?: (compra: Compra) => void;
  isLoading?: boolean;
}

export function CompraTable({
  compras,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onManagePayments,
  isLoading = false,
}: CompraTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Compra>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return formatDate(date, "dd/MM/yyyy HH:mm");
        },
      },
      {
        accessorKey: "fornecedor.nome",
        header: "Fornecedor",
        cell: ({ row }) => row.original.fornecedor?.nome || "N/A",
      },
      {
        accessorKey: "ticket.pesoLiquido",
        header: "Quantidade (kg)",
        cell: ({ row }) => {
          const peso = row.original.ticket?.pesoLiquido || 0;
          return peso.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        },
      },
      {
        accessorKey: "precoPorKg",
        header: "Preço/Kg",
        cell: ({ row }) => {
          const preco = row.getValue("precoPorKg") as number;
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(preco);
        },
      },
      {
        accessorKey: "valorTotal",
        header: "Valor Total",
        cell: ({ row }) => {
          const valor = row.getValue("valorTotal") as number;
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(valor);
        },
      },
      {
        accessorKey: "qualidade",
        header: "Qualidade",
        cell: ({ row }) => {
          const qualidade = row.getValue("qualidade") as number;
          const getQualidadeLabel = (value: number) => {
            if (value >= 9) return "Premium";
            if (value >= 7) return "Especial";
            if (value >= 5) return "Comercial";
            return "Industrial";
          };
          const getQualidadeColor = (value: number) => {
            if (value >= 9) return "bg-green-100 text-green-800";
            if (value >= 7) return "bg-blue-100 text-blue-800";
            if (value >= 5) return "bg-yellow-100 text-yellow-800";
            return "bg-red-100 text-red-800";
          };
          return (
            <Badge className={getQualidadeColor(qualidade)}>
              {getQualidadeLabel(qualidade)} ({qualidade}/10)
            </Badge>
          );
        },
      },
      {
        accessorKey: "statusPagamento",
        header: "Status Pagamento",
        cell: ({ row }) => {
          const statusPagamento = row.original.statusPagamento;
          if (!statusPagamento) return <span className="text-gray-400">—</span>;

          const getPaymentStatusColor = (status: string) => {
            switch (status) {
              case "PAGO":
                return "bg-green-100 text-green-800";
              case "PARCIAL":
                return "bg-blue-100 text-blue-800";
              case "PENDENTE":
                return "bg-yellow-100 text-yellow-800";
              default:
                return "bg-gray-100 text-gray-800";
            }
          };

          const getPaymentStatusIcon = (status: string) => {
            switch (status) {
              case "PAGO":
                return <CheckCircle className="h-3 w-3" />;
              case "PARCIAL":
                return <Clock className="h-3 w-3" />;
              case "PENDENTE":
                return <XCircle className="h-3 w-3" />;
              default:
                return null;
            }
          };

          return (
            <Badge className={getPaymentStatusColor(statusPagamento)}>
              {getPaymentStatusIcon(statusPagamento)}
              <span className="ml-1">
                {statusPagamento === "PAGO" ? "Pago" :
                 statusPagamento === "PARCIAL" ? "Parcial" : "Pendente"}
              </span>
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const compra = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  onClick={() => onEdit(compra)}
                  className="text-blue-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {/**@ts-expect-error err */}
                {compra?.statusPagamento?.toLowerCase() === "pendente" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onApprove(compra.id)}
                      className="text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onReject(compra.id)}
                      className="text-red-600 "
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
                {onManagePayments && (
                  <DropdownMenuItem
                    onClick={() => onManagePayments(compra)}
                    className="text-green-600"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pagamentos
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
          );
        },
      },
    ],
    [onEdit, onDelete, onApprove, onReject, onManagePayments]
  );

  const table = useReactTable({
    data: compras,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando compras...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Compras ({compras.length})
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar compras..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center "
                  >
                    Nenhuma compra encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CompraTable;
