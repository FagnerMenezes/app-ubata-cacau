import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comprasService } from '@/services/compras'
import type {
  Compra,
  CreateCompraData,
  UpdateCompraData,
  CompraFilters
} from '@/types/compra'
import { toast } from 'sonner'

// Query Keys
export const compraKeys = {
  all: ['compras'] as const,
  lists: () => [...compraKeys.all, 'list'] as const,
  list: (filters: CompraFilters) => [...compraKeys.lists(), filters] as const,
  details: () => [...compraKeys.all, 'detail'] as const,
  detail: (id: string) => [...compraKeys.details(), id] as const,
  stats: (periodo?: string) => [...compraKeys.all, 'stats', periodo] as const,
  relatorios: () => [...compraKeys.all, 'relatorios'] as const,
  relatorioFornecedor: (fornecedorId: string, periodo?: string) => 
    [...compraKeys.relatorios(), 'fornecedor', fornecedorId, periodo] as const,
  relatorioQualidade: (periodo?: string) => 
    [...compraKeys.relatorios(), 'qualidade', periodo] as const,
}

// Hook para listar compras
export function useCompras(filters?: CompraFilters) {
  return useQuery({
    queryKey: compraKeys.list(filters || {}),
    queryFn: () => comprasService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar compra por ID
export function useCompra(id: string) {
  return useQuery({
    queryKey: compraKeys.detail(id),
    queryFn: () => comprasService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para estatísticas de compras
export function useComprasStats(periodo?: 'mes' | 'trimestre' | 'ano') {
  return useQuery({
    queryKey: compraKeys.stats(periodo),
    queryFn: () => comprasService.getStats(periodo),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para relatório por fornecedor
export function useRelatorioFornecedor(fornecedorId: string, periodo?: string) {
  return useQuery({
    queryKey: compraKeys.relatorioFornecedor(fornecedorId, periodo),
    queryFn: () => comprasService.getRelatorioFornecedor(fornecedorId, periodo),
    enabled: !!fornecedorId,
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para relatório de qualidade
export function useRelatorioQualidade(periodo?: string) {
  return useQuery({
    queryKey: compraKeys.relatorioQualidade(periodo),
    queryFn: () => comprasService.getRelatorioQualidade(periodo),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para criar compra
export function useCreateCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompraData) => comprasService.create(data),
    onSuccess: (newCompra) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compraKeys.stats() })
      
      // Adicionar a nova compra ao cache
      queryClient.setQueryData(
        compraKeys.detail(newCompra.id),
        newCompra
      )

      toast.success('Compra registrada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar compra')
    },
  })
}

// Hook para atualizar compra
export function useUpdateCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompraData }) =>
      comprasService.update(id, data),
    onSuccess: (updatedCompra, variables) => {
      // Verificar se updatedCompra existe e tem id
      if (updatedCompra && updatedCompra.id) {
        // Atualizar cache da compra específica
        queryClient.setQueryData(
          compraKeys.detail(updatedCompra.id),
          updatedCompra
        )
      }

      // Invalidar listas e estatísticas usando o ID da variável se necessário
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compraKeys.stats() })

      // Se existe uma compra específica, invalidar também seu detalhe
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: compraKeys.detail(variables.id) })
      }

      toast.success('Compra atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar compra')
    },
  })
}

// Hook para deletar compra
export function useDeleteCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => comprasService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: compraKeys.detail(deletedId) })
      
      // Invalidar listas e estatísticas
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compraKeys.stats() })

      toast.success('Compra removida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover compra')
    },
  })
}

// Hook para confirmar compra
export function useConfirmarCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => comprasService.confirmar(id),
    onSuccess: (updatedCompra) => {
      // Atualizar cache
      queryClient.setQueryData(
        compraKeys.detail(updatedCompra.id),
        updatedCompra
      )

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })

      toast.success('Compra confirmada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao confirmar compra')
    },
  })
}

// Hook para marcar compra como entregue
export function useMarcarEntregue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dataEntrega }: { id: string; dataEntrega?: string }) =>
      comprasService.marcarEntregue(id, dataEntrega),
    onSuccess: (updatedCompra) => {
      // Atualizar cache
      queryClient.setQueryData(
        compraKeys.detail(updatedCompra.id),
        updatedCompra
      )

      // Invalidar listas e estatísticas
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compraKeys.stats() })

      toast.success('Compra marcada como entregue!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao marcar entrega')
    },
  })
}

// Hook para cancelar compra
export function useCancelarCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      comprasService.cancelar(id, motivo),
    onSuccess: (updatedCompra) => {
      // Atualizar cache
      queryClient.setQueryData(
        compraKeys.detail(updatedCompra.id),
        updatedCompra
      )

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: compraKeys.lists() })

      toast.success('Compra cancelada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar compra')
    },
  })
}

// Hook para verificar se compra pode ser editada (sem pagamentos)
export function useCompraCanEdit(compra?: Compra) {
  // Se não tem informação da compra, assumir que pode editar
  if (!compra) return true;

  // Se statusPagamento não é PENDENTE, significa que tem pagamentos
  return compra.statusPagamento === 'PENDENTE';
}