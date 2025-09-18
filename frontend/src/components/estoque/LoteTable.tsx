import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Search, 
  Filter,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Lote {
  id: string
  codigo: string
  fornecedorId: string
  fornecedorNome: string
  dataEntrada: string
  quantidade: number
  quantidadeDisponivel: number
  qualidade: 'premium' | 'especial' | 'comercial'
  umidade: number
  fermentacao: 'excelente' | 'boa' | 'regular'
  precoKg: number
  valorTotal: number
  dataValidade: string
  localizacao: string
  observacoes?: string
  status: 'ativo' | 'reservado' | 'vencido' | 'esgotado'
  createdAt: string
}

interface LoteTableProps {
  lotes: Lote[]
  onView: (lote: Lote) => void
  onEdit: (lote: Lote) => void
  onDelete: (id: string) => void
  onEntrada: (loteId: string) => void
  onSaida: (loteId: string) => void
  isLoading?: boolean
}

export default function LoteTable({
  lotes,
  onView,
  onEdit,
  onDelete,
  onEntrada,
  onSaida,
  isLoading = false
}: LoteTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const getStatusBadge = (status: Lote['status']) => {
    const variants = {
      ativo: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      reservado: { variant: 'secondary' as const, label: 'Reservado', icon: Package },
      vencido: { variant: 'destructive' as const, label: 'Vencido', icon: AlertTriangle },
      esgotado: { variant: 'outline' as const, label: 'Esgotado', icon: Package }
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getQualidadeBadge = (qualidade: Lote['qualidade']) => {
    const variants = {
      premium: { variant: 'default' as const, label: 'Premium' },
      especial: { variant: 'secondary' as const, label: 'Especial' },
      comercial: { variant: 'outline' as const, label: 'Comercial' }
    }
    const config = variants[qualidade]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getDiasParaVencimento = (dataValidade: string) => {
    const hoje = new Date()
    const vencimento = new Date(dataValidade)
    const diffTime = vencimento.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const columns: ColumnDef<Lote>[] = [
    {
      accessorKey: 'codigo',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Código
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('codigo')}</div>
      ),
    },
    {
      accessorKey: 'fornecedorNome',
      header: 'Fornecedor',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {row.getValue('fornecedorNome')}
        </div>
      ),
    },
    {
      accessorKey: 'dataEntrada',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Data Entrada
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const data = new Date(row.getValue('dataEntrada'))
        return format(data, 'dd/MM/yyyy', { locale: ptBR })
      },
    },
    {
      accessorKey: 'quantidade',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Quantidade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quantidade = row.getValue('quantidade') as number
        const disponivel = row.original.quantidadeDisponivel
        return (
          <div className="text-right">
            <div className="font-medium">{disponivel.toLocaleString('pt-BR')} kg</div>
            <div className="text-xs text-muted-foreground">
              de {quantidade.toLocaleString('pt-BR')} kg
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'qualidade',
      header: 'Qualidade',
      cell: ({ row }) => getQualidadeBadge(row.getValue('qualidade')),
    },
    {
      accessorKey: 'precoKg',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Preço/kg
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const preco = row.getValue('precoKg') as number
        return (
          <div className="text-right font-medium">
            R$ {preco.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: 'dataValidade',
      header: 'Validade',
      cell: ({ row }) => {
        const dataValidade = row.getValue('dataValidade') as string
        const diasParaVencimento = getDiasParaVencimento(dataValidade)
        const data = new Date(dataValidade)
        
        return (
          <div className="text-right">
            <div className="font-medium">
              {format(data, 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className={`text-xs ${
              diasParaVencimento <= 15 ? 'text-red-600' : 
              diasParaVencimento <= 30 ? 'text-orange-600' : 
              'text-muted-foreground'
            }`}>
              {diasParaVencimento > 0 ? `${diasParaVencimento} dias` : 'Vencido'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'localizacao',
      header: 'Localização',
      cell: ({ row }) => (
        <div className="text-center font-mono text-sm">
          {row.getValue('localizacao')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const lote = row.original
        const podeMovimentar = lote.status === 'ativo' && lote.quantidadeDisponivel > 0

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(lote)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {podeMovimentar && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEntrada(lote.id)}
                  title="Entrada"
                >
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSaida(lote.id)}
                  title="Saída"
                >
                  <ArrowDownCircle className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => onEdit(lote)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(lote.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: lotes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-96 bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lotes..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} lote(s) encontrado(s)
        </div>
      </div>

      {/* Tabela */}
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
                  data-state={row.getIsSelected() && 'selected'}
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
                  className="h-24 text-center"
                >
                  Nenhum lote encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}