import { fornecedoresService } from "@/services/fornecedores";
import type {
  CreateFornecedorData,
  FornecedorFilters,
  UpdateFornecedorData,
} from "@/types/fornecedor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const fornecedorKeys = {
  all: ["fornecedores"] as const,
  lists: () => [...fornecedorKeys.all, "list"] as const,
  list: (filters: FornecedorFilters) =>
    [...fornecedorKeys.lists(), filters] as const,
  details: () => [...fornecedorKeys.all, "detail"] as const,
  detail: (id: string) => [...fornecedorKeys.details(), id] as const,
  stats: (id: string) => [...fornecedorKeys.all, "stats", id] as const,
  compras: (id: string) => [...fornecedorKeys.all, "compras", id] as const,
};

// Hook para listar fornecedores
export function useFornecedores(filters?: FornecedorFilters) {
  return useQuery({
    queryKey: fornecedorKeys.list(filters || {}),
    queryFn: () => fornecedoresService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar fornecedor por ID
export function useFornecedor(id: string) {
  return useQuery({
    queryKey: fornecedorKeys.detail(id),
    queryFn: () => fornecedoresService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para estatísticas do fornecedor
export function useFornecedorStats(id: string) {
  return useQuery({
    queryKey: fornecedorKeys.stats(id),
    queryFn: () => fornecedoresService.getStats(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para compras do fornecedor
export function useFornecedorCompras(id: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: [...fornecedorKeys.compras(id), page, limit],
    queryFn: () => fornecedoresService.getCompras(id, page, limit),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para criar fornecedor
export function useCreateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFornecedorData) =>
      fornecedoresService.create(data),
    onSuccess: (newFornecedor) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.lists() });

      // Adicionar o novo fornecedor ao cache
      queryClient.setQueryData(
        fornecedorKeys.detail(newFornecedor.id),
        newFornecedor
      );

      toast.success("Fornecedor criado com sucesso!");
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar fornecedor");
    },
  });
}

// Hook para atualizar fornecedor
export function useUpdateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFornecedorData }) =>
      fornecedoresService.update(id, data),
    onSuccess: (updatedFornecedor) => {
      // Atualizar cache do fornecedor específico
      queryClient.setQueryData(
        fornecedorKeys.detail(updatedFornecedor.id),
        updatedFornecedor
      );

      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.lists() });

      toast.success("Fornecedor atualizado com sucesso!");
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erro ao atualizar fornecedor"
      );
    },
  });
}

// Hook para deletar fornecedor
export function useDeleteFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fornecedoresService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: fornecedorKeys.detail(deletedId) });

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.lists() });

      toast.success("Fornecedor removido com sucesso!");
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erro ao remover fornecedor"
      );
    },
  });
}

// Hook para alternar status do fornecedor
export function useToggleFornecedorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fornecedoresService.toggleStatus(id),
    onSuccess: (updatedFornecedor) => {
      // Atualizar cache
      queryClient.setQueryData(
        fornecedorKeys.detail(updatedFornecedor.id),
        updatedFornecedor
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: fornecedorKeys.lists() });

      const status =
        "atualizado";
      toast.success(`Fornecedor ${status} com sucesso!`);
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao alterar status");
    },
  });
}
