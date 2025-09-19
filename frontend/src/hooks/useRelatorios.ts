import type { RelatorioFilters } from "@/services/relatorios";
import { relatoriosService } from "@/services/relatorios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const relatorioKeys = {
  all: ["relatorios"] as const,
  compras: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "compras", filters] as const,
  fornecedores: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "fornecedores", filters] as const,
  pagamentos: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "pagamentos", filters] as const,
  fluxoCaixa: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "fluxo-caixa", filters] as const,
  resumoFinanceiro: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "resumo-financeiro", filters] as const,
  unificadoFornecedor: (filters: RelatorioFilters) =>
    [...relatorioKeys.all, "unificado-fornecedor", filters] as const,
};

// Hook para relatório de compras
export function useRelatorioCompras(filters: RelatorioFilters = {}) {
  return useQuery({
    queryKey: relatorioKeys.compras(filters),
    queryFn: () => relatoriosService.getRelatorioCompras(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para relatório de fornecedores
export function useRelatorioFornecedores(filters: RelatorioFilters = {}) {
  return useQuery({
    queryKey: relatorioKeys.fornecedores(filters),
    queryFn: () => relatoriosService.getRelatorioFornecedores(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para relatório de pagamentos
export function useRelatorioPagamentos(filters: RelatorioFilters = {}) {
  return useQuery({
    queryKey: relatorioKeys.pagamentos(filters),
    queryFn: () => relatoriosService.getRelatorioPagamentos(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para relatório de fluxo de caixa
export function useFluxoCaixa(filters: RelatorioFilters = {}) {
  return useQuery({
    queryKey: relatorioKeys.fluxoCaixa(filters),
    queryFn: () => relatoriosService.getFluxoCaixa(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para resumo financeiro
export function useResumoFinanceiro(filters: RelatorioFilters = {}) {
  return useQuery({
    queryKey: relatorioKeys.resumoFinanceiro(filters),
    queryFn: () => relatoriosService.getResumoFinanceiro(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para relatório unificado do fornecedor
export function useRelatorioUnificadoFornecedor(
  filters: RelatorioFilters = {}
) {
  return useQuery({
    queryKey: relatorioKeys.unificadoFornecedor(filters),
    queryFn: () => relatoriosService.getRelatorioUnificadoFornecedor(filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!filters.fornecedorId, // Só executa se tiver fornecedorId
  });
}

// Hook para exportar CSV
export function useExportarCSV() {
  return useMutation({
    mutationFn: async ({
      tipo,
      filters,
    }: {
      tipo: string;
      filters: RelatorioFilters;
    }) => {
      const blob = await relatoriosService.exportarCSV(tipo, filters);

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${tipo}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success("Relatório CSV exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar relatório CSV");
    },
  });
}

// Hook para exportar PDF
export function useExportarPDF() {
  return useMutation({
    mutationFn: async ({
      tipo,
      filters,
    }: {
      tipo: string;
      filters: RelatorioFilters;
    }) => {
      const blob = await relatoriosService.exportarPDF(tipo, filters);

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${tipo}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success("Relatório PDF exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório PDF");
    },
  });
}
