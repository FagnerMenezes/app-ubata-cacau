import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagamentosService } from '@/services/pagamentos'
import type {
  CreatePagamentoData,
  UpdatePagamentoData,
  PagamentoFilters
} from '@/types/pagamento'
import { toast } from 'sonner'

// Query Keys
export const pagamentoKeys = {
  all: ['pagamentos'] as const,
  lists: () => [...pagamentoKeys.all, 'list'] as const,
  list: (filters: PagamentoFilters) => [...pagamentoKeys.lists(), filters] as const,
  details: () => [...pagamentoKeys.all, 'detail'] as const,
  detail: (id: string) => [...pagamentoKeys.details(), id] as const,
  stats: (params?: any) => [...pagamentoKeys.all, 'stats', params] as const,
  byCompra: (compraId: string) => [...pagamentoKeys.all, 'byCompra', compraId] as const,
  validation: (compraId: string, valor: number) => [...pagamentoKeys.all, 'validation', compraId, valor] as const,
  recibo: (id: string) => [...pagamentoKeys.all, 'recibo', id] as const,
}

// Hook para listar pagamentos
export function usePagamentos(filters?: PagamentoFilters) {
  return useQuery({
    queryKey: pagamentoKeys.list(filters || {}),
    queryFn: () => pagamentosService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar pagamento por ID
export function usePagamento(id: string) {
  return useQuery({
    queryKey: pagamentoKeys.detail(id),
    queryFn: () => pagamentosService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para listar pagamentos por compra
export function usePagamentosByCompra(compraId: string) {
  return useQuery({
    queryKey: pagamentoKeys.byCompra(compraId),
    queryFn: () => pagamentosService.getByCompra(compraId),
    enabled: !!compraId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para estatísticas de pagamentos
export function usePagamentosStats(params?: {
  fornecedorId?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: pagamentoKeys.stats(params),
    queryFn: () => pagamentosService.getStats(params),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para validação de pagamento
export function useValidatePagamento(compraId: string, valor: number) {
  return useQuery({
    queryKey: pagamentoKeys.validation(compraId, valor),
    queryFn: () => pagamentosService.validate(compraId, valor),
    enabled: !!compraId && valor > 0,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

// Hook para gerar recibo
export function useReciboPagamento(id: string) {
  return useQuery({
    queryKey: pagamentoKeys.recibo(id),
    queryFn: () => pagamentosService.generateRecibo(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutos
  })
}

// Hook para criar pagamento
export function useCreatePagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePagamentoData) => pagamentosService.create(data),
    onSuccess: (newPagamento, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.stats() })
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.byCompra(variables.compraId) })

      // Invalidar queries de compras para atualizar status
      queryClient.invalidateQueries({ queryKey: ['compras'] })

      // Adicionar o novo pagamento ao cache
      queryClient.setQueryData(
        pagamentoKeys.detail(newPagamento.id),
        newPagamento
      )

      toast.success('Pagamento registrado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento')
    },
  })
}

// Hook para atualizar pagamento
export function useUpdatePagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePagamentoData }) =>
      pagamentosService.update(id, data),
    onSuccess: (updatedPagamento) => {
      // Atualizar cache do pagamento específico
      if (updatedPagamento && updatedPagamento.id) {
        queryClient.setQueryData(
          pagamentoKeys.detail(updatedPagamento.id),
          updatedPagamento
        )
      }

      // Invalidar listas e estatísticas
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.stats() })

      // Se existe uma compra associada, invalidar também
      if (updatedPagamento?.compraId) {
        queryClient.invalidateQueries({ queryKey: pagamentoKeys.byCompra(updatedPagamento.compraId) })
      }

      // Invalidar queries de compras para atualizar status
      queryClient.invalidateQueries({ queryKey: ['compras'] })

      toast.success('Pagamento atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar pagamento')
    },
  })
}

// Hook para deletar pagamento
export function useDeletePagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; compraId?: string }) => pagamentosService.delete(id),
    onSuccess: (_, variables) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: pagamentoKeys.detail(variables.id) })

      // Invalidar listas e estatísticas
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.stats() })

      // Invalidar pagamentos por compra
      if (variables.compraId) {
        queryClient.invalidateQueries({ queryKey: pagamentoKeys.byCompra(variables.compraId) })
      }

      // Invalidar queries de compras para atualizar status
      queryClient.invalidateQueries({ queryKey: ['compras'] })

      toast.success('Pagamento removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover pagamento')
    },
  })
}

// Hook para obter saldo restante de uma compra
export function useSaldoRestante(compraId: string) {
  return useQuery({
    queryKey: [...pagamentoKeys.byCompra(compraId), 'saldo'],
    queryFn: () => pagamentosService.getSaldoRestante(compraId),
    enabled: !!compraId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}