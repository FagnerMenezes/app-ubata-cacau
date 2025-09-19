import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsService } from '@/services/tickets'
import type {
  CreateTicketInput,
  UpdateTicketInput,
  TicketQuery
} from '@/types/ticket'
import { toast } from 'sonner'
import { printTicket } from '@/lib/print'

// Query Keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (query: TicketQuery) => [...ticketKeys.lists(), query] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  available: () => [...ticketKeys.all, 'available'] as const,
  byFornecedor: (fornecedorId: string) => [...ticketKeys.all, 'fornecedor', fornecedorId] as const,
  stats: (fornecedorId?: string) => [...ticketKeys.all, 'stats', fornecedorId] as const,
}

// Hook para listar tickets
export function useTickets(query?: TicketQuery) {
  return useQuery({
    queryKey: ticketKeys.list(query || {}),
    queryFn: () => ticketsService.getAll(query),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar ticket por ID
export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para tickets disponíveis para compra
export function useAvailableTickets() {
  return useQuery({
    queryKey: ticketKeys.available(),
    queryFn: () => ticketsService.getAvailableForPurchase(),
    staleTime: 2 * 60 * 1000, // 2 minutos (mais frequente pois afeta compras)
  })
}

// Hook para tickets por fornecedor
export function useTicketsByFornecedor(fornecedorId: string, query?: Omit<TicketQuery, 'fornecedorId'>) {
  return useQuery({
    queryKey: [...ticketKeys.byFornecedor(fornecedorId), query],
    queryFn: () => ticketsService.getByFornecedor(fornecedorId, query),
    enabled: !!fornecedorId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para estatísticas de tickets
export function useTicketsStats(fornecedorId?: string) {
  return useQuery({
    queryKey: ticketKeys.stats(fornecedorId),
    queryFn: () => ticketsService.getStats(fornecedorId),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para criar ticket
export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTicketInput) => ticketsService.create(data),
    onSuccess: (newTicket) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.available() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.byFornecedor(newTicket.fornecedorId) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() })

      // Adicionar o novo ticket ao cache
      queryClient.setQueryData(
        ticketKeys.detail(newTicket.id),
        newTicket
      )

      toast.success('Ticket criado com sucesso!')
      
      // Impressão automática do ticket
      try {
        printTicket(newTicket, { autoprint: true })
      } catch (error) {
        console.warn('Erro na impressão automática:', error)
        toast.info('Ticket criado! Clique para imprimir manualmente.')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar ticket')
    },
  })
}

// Hook para atualizar ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketsService.update(id, data),
    onSuccess: (updatedTicket) => {
      // Atualizar cache do ticket específico
      queryClient.setQueryData(
        ticketKeys.detail(updatedTicket.id),
        updatedTicket
      )

      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.available() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.byFornecedor(updatedTicket.fornecedorId) })

      toast.success('Ticket atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar ticket')
    },
  })
}

// Hook para deletar ticket
export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ticketsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: ticketKeys.detail(deletedId) })

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.available() })

      toast.success('Ticket removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover ticket')
    },
  })
}

// Hook para converter ticket em compra
export function useConvertTicketToCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, compraData }: {
      ticketId: string;
      compraData: { precoPorKg: number; observacoes?: string }
    }) => ticketsService.convertToCompra(ticketId, compraData),
    onSuccess: (convertedTicket) => {
      // Atualizar cache do ticket
      queryClient.setQueryData(
        ticketKeys.detail(convertedTicket.id),
        convertedTicket
      )

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.available() })
      queryClient.invalidateQueries({ queryKey: ['compras'] }) // Invalidar compras também

      toast.success('Ticket convertido em compra com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao converter ticket')
    },
  })
}