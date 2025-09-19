import {
  generateCacaoMovementReport,
  generateFinancialReportPDF,
  generatePaymentReceiptPDF,
  generateUnifiedSupplierReportPDF,
} from "@/lib/pdf-generator";
import { pagamentosService } from "@/services/pagamentos";
import type { RelatorioUnificadoFornecedor } from "@/services/relatorios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Hook para gerar PDF de recibo de pagamento
export function useGeneratePaymentReceiptPDF() {
  return useMutation({
    mutationFn: async (pagamentoId: string) => {
      // Buscar dados do recibo
      const reciboData = await pagamentosService.generateRecibo(pagamentoId);

      // Gerar PDF
      generatePaymentReceiptPDF(reciboData.recibo);

      return reciboData;
    },
    onSuccess: () => {
      toast.success("Recibo PDF gerado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao gerar recibo PDF:", error);
      toast.error("Erro ao gerar recibo PDF");
    },
  });
}

// Hook para gerar relatório de movimentação de cacau
export function useGenerateCacaoMovementReport() {
  return useMutation({
    mutationFn: async (data: {
      periodo: { inicio: string; fim: string };
      movimentacoes: Array<{
        data: string;
        historico: string;
        credito: number;
        debito: number;
        saldo: number;
      }>;
      totais: {
        credito: number;
        debito: number;
        saldo: number;
      };
    }) => {
      // Gerar PDF do relatório
      generateCacaoMovementReport(data);

      return data;
    },
    onSuccess: () => {
      toast.success("Relatório PDF gerado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao gerar relatório PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    },
  });
}

// Hook para gerar relatório financeiro em PDF
export function useGenerateFinancialReportPDF() {
  return useMutation({
    mutationFn: async (data: {
      tipo: string;
      titulo: string;
      periodo: { inicio: string; fim: string };
      metricas: any;
      dados: any[];
      resumo?: any;
    }) => {
      // Gerar PDF do relatório
      generateFinancialReportPDF(data);

      return data;
    },
    onSuccess: () => {
      toast.success("Relatório financeiro PDF gerado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao gerar relatório financeiro PDF:", error);
      toast.error("Erro ao gerar relatório financeiro PDF");
    },
  });
}

// Hook para gerar PDF do relatório unificado do fornecedor
export function useGenerateUnifiedSupplierReportPDF() {
  return useMutation({
    mutationFn: async (data: RelatorioUnificadoFornecedor) => {
      // Gerar PDF do relatório unificado
      generateUnifiedSupplierReportPDF(data);

      return data;
    },
    onSuccess: () => {
      toast.success("Relatório unificado PDF gerado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao gerar relatório unificado PDF:", error);
      toast.error("Erro ao gerar relatório unificado PDF");
    },
  });
}
