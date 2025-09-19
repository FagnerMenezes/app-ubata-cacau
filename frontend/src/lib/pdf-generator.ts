import type { ReciboPagamento } from "@/types/pagamento";
import jsPDF from "jspdf";

// Função para converter número para texto em português
function numberToWords(num: number): string {
  const ones = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
    "dez",
    "onze",
    "doze",
    "treze",
    "catorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];

  const tens = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];

  const hundreds = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (num === 0) return "zero";
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? " e " + ones[one] : "");
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (
      hundreds[hundred] + (remainder ? " e " + numberToWords(remainder) : "")
    );
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      numberToWords(thousand) +
      " mil" +
      (remainder ? " e " + numberToWords(remainder) : "")
    );
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return (
      numberToWords(million) +
      " milhão" +
      (remainder ? " e " + numberToWords(remainder) : "")
    );
  }

  return "valor muito alto";
}

// Função para formatar valor monetário
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Função para formatar data
function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

// Função para formatar data completa
function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
}

export function generatePaymentReceiptPDF(recibo: ReciboPagamento): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Configurações de fonte mais compactas
  const fontSize = {
    small: 7,
    normal: 8,
    medium: 9,
    large: 11,
    xlarge: 13,
  };

  // Cores (em RGB)
  const colors = {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    gray: [128, 128, 128],
    lightGray: [200, 200, 200],
  };

  // Espaçamentos dinâmicos baseados no conteúdo
  const spacing = {
    small: 3,
    normal: 4,
    medium: 6,
    large: 8,
  };

  let yPosition = 15;

  // Cabeçalho da empresa - mais compacto
  doc.setFontSize(fontSize.xlarge);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont("helvetica", "bold");
  doc.text("UBATA CACAU", pageWidth / 2, yPosition, { align: "center" });

  yPosition += spacing.medium;
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  doc.text("RUA DOM EDUARDO - UBATA-BA", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += spacing.large;

  // Informações de emissão - lado direito
  doc.setFontSize(fontSize.small);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text(
    `Emissão: ${formatDateTime(recibo.data)}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  );

  yPosition += spacing.medium;

  // Linha separadora
  doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += spacing.medium;

  // Título do recibo
  doc.setFontSize(fontSize.large);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PAGAMENTO", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += spacing.medium;

  // Informações do documento - lado a lado
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  doc.text(`DOCUMENTO Nº: ${recibo.id}`, 15, yPosition);
  doc.text(`Data: ${formatDate(recibo.data)}`, pageWidth - 15, yPosition, {
    align: "right",
  });

  yPosition += spacing.large;

  // Informações do fornecedor - mais compacto
  doc.setFont("helvetica", "bold");
  doc.text("FORNECEDOR:", 15, yPosition);
  yPosition += spacing.normal;

  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${recibo.fornecedor.nome}`, 15, yPosition);
  yPosition += spacing.small;
  doc.text(`Documento: ${recibo.fornecedor.documento}`, 15, yPosition);

  yPosition += spacing.large;

  // Detalhes da compra - lado a lado para economizar espaço
  doc.setFont("helvetica", "bold");
  doc.text("DETALHES DA COMPRA:", 15, yPosition);
  yPosition += spacing.normal;

  doc.setFont("helvetica", "normal");
  // Primeira linha: Ticket e Peso
  doc.text(`Ticket: ${recibo.compra.ticket.numeroTicket}`, 15, yPosition);
  doc.text(
    `Peso: ${recibo.compra.ticket.pesoLiquido.toFixed(2)} Kg`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  );
  yPosition += spacing.small;

  // Segunda linha: Preço e Valor Total
  doc.text(`Preço/Kg: ${formatCurrency(recibo.compra.precoKg)}`, 15, yPosition);
  doc.text(
    `Total: ${formatCurrency(recibo.compra.valorTotal)}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  );

  yPosition += spacing.large;

  // Tabela de pagamento - mais compacta
  doc.setFont("helvetica", "bold");
  doc.text("PAGAMENTO:", 15, yPosition);
  yPosition += spacing.normal;

  // Tabela simplificada em duas colunas
  const tableStartX = 15;
  const tableWidth = pageWidth - 30;
  const colWidths = [tableWidth * 0.5, tableWidth * 0.5];

  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(tableStartX, yPosition - 3, tableWidth, 6, "F");

  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFontSize(fontSize.small);
  doc.setFont("helvetica", "bold");

  doc.text("Descrição", tableStartX + 3, yPosition);
  doc.text("Valor", tableStartX + colWidths[0] + 3, yPosition);

  yPosition += spacing.normal;

  // Linha de dados
  doc.setFont("helvetica", "normal");
  doc.text(`Pagamento ${recibo.numeroPagamento}`, tableStartX + 3, yPosition);
  doc.text(
    formatCurrency(recibo.valor),
    tableStartX + colWidths[0] + 3,
    yPosition
  );

  yPosition += spacing.medium;

  // Resumo financeiro - lado a lado para economizar espaço
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO FINANCEIRO:", 15, yPosition);
  yPosition += spacing.normal;

  doc.setFont("helvetica", "normal");
  // Primeira linha: Total da Compra e Total Pago
  doc.text(
    `Total Compra: ${formatCurrency(recibo.resumo.valorTotalCompra)}`,
    15,
    yPosition
  );
  doc.text(
    `Total Pago: ${formatCurrency(recibo.resumo.valorTotalPago)}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  );
  yPosition += spacing.small;

  // Segunda linha: Saldo Restante e Percentual
  doc.text(
    `Saldo Restante: ${formatCurrency(recibo.resumo.saldoRestante)}`,
    15,
    yPosition
  );
  doc.text(
    `% Pago: ${recibo.resumo.percentualPago.toFixed(1)}%`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  );

  yPosition += spacing.large;

  // Declaração de recebimento - mais compacta
  doc.setFont("helvetica", "bold");
  doc.text("DECLARAÇÃO DE RECEBIMENTO:", 15, yPosition);
  yPosition += spacing.normal;

  doc.setFont("helvetica", "normal");
  doc.text(
    "Declaro que recebi da compradora a quantia abaixo discriminada:",
    15,
    yPosition
  );
  yPosition += spacing.small;

  const valorPorExtenso = numberToWords(Math.floor(recibo.valor)) + " REAIS";
  doc.setFont("helvetica", "bold");
  doc.text(
    `${formatCurrency(recibo.valor)} (${valorPorExtenso})`,
    15,
    yPosition
  );

  yPosition += spacing.large;

  // Seção de assinaturas - mais compacta
  const signatureY = yPosition;
  doc.setFont("helvetica", "normal");
  doc.text("Usuário: _________________________", 15, signatureY);
  doc.text("Conferido: _________________________", pageWidth - 15, signatureY, {
    align: "right",
  });

  yPosition += spacing.medium;
  doc.text("Gerência: _________________________", 15, yPosition);
  doc.text(`UBATA-BA, ${formatDate(recibo.data)}`, pageWidth - 15, yPosition, {
    align: "right",
  });

  yPosition += spacing.medium;
  doc.text(`Assinatura: ${recibo.fornecedor.nome}`, 15, yPosition);

  // Rodapé com declarações legais - mais compacto
  yPosition += spacing.large;
  doc.setFontSize(fontSize.small);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);

  // Verificar se há espaço suficiente para as declarações legais
  const remainingSpace = pageHeight - yPosition - 20;
  const legalTextHeight = 25; // Altura estimada das declarações

  if (remainingSpace < legalTextHeight) {
    // Se não há espaço suficiente, pular as declarações legais para manter em uma página
    yPosition = pageHeight - 15;
  } else {
    const legalText = [
      "1. O vendedor declara sob as penas da lei, que a mercadoria vendida é de sua exclusiva e única produção,",
      "a qual, se acha completamente livre desembaraçada de quaisquer ônus convencionais ou legais, estando em",
      "condições de pronta comercialização, razão por que, neste ato assume total e inequívoca responsabilidade",
      "quanto a sua entrega.",
      "",
      "2. FUNRURAL: POR CONTA DO VENDEDOR (ART 05 DA LEI Nº 8212/91)",
    ];

    legalText.forEach((line) => {
      if (yPosition > pageHeight - 20) {
        return; // Não adicionar mais texto se não há espaço
      }
      doc.text(line, 15, yPosition);
      yPosition += 4;
    });
  }

  // Salvar o PDF
  const fileName = `recibo_pagamento_${recibo.id}_${formatDate(
    recibo.data
  ).replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}

// Função para gerar relatório de movimentação de cacau
export function generateCacaoMovementReport(data: {
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
}): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("UBATA CACAU", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("RUA DOM EDUARDO - UBATA-BA", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 15;
  doc.setFontSize(10);
  doc.text(
    `Emissão: ${formatDateTime(new Date())}`,
    pageWidth - 20,
    yPosition,
    { align: "right" }
  );

  yPosition += 10;
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // Título do relatório
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    `MOVIMENTAÇÃO GERAL DE CACAU - PERÍODO: ${data.periodo.inicio} A ${data.periodo.fim}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  yPosition += 20;

  // Tabela de movimentações
  const tableStartX = 20;
  const tableWidth = pageWidth - 40;
  const colWidths = [20, 30, 40, 25, 25, 25];

  // Cabeçalho da tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(tableStartX, yPosition - 5, tableWidth, 10, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Data", tableStartX + 2, yPosition);
  doc.text("Histórico", tableStartX + colWidths[0] + 2, yPosition);
  doc.text("Crédito", tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
  doc.text(
    "Débito",
    tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2,
    yPosition
  );
  doc.text(
    "Saldo",
    tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2,
    yPosition
  );

  yPosition += 10;

  // Dados da tabela
  doc.setFont("helvetica", "normal");
  data.movimentacoes.forEach((mov) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(formatDate(mov.data), tableStartX + 2, yPosition);
    doc.text(mov.historico, tableStartX + colWidths[0] + 2, yPosition);
    doc.text(
      mov.credito.toString(),
      tableStartX + colWidths[0] + colWidths[1] + 2,
      yPosition
    );
    doc.text(
      mov.debito.toString(),
      tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2,
      yPosition
    );
    doc.text(
      mov.saldo.toString(),
      tableStartX +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        2,
      yPosition
    );

    yPosition += 6;
  });

  // Totais
  yPosition += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Total no relatório ->", tableStartX + 2, yPosition);
  doc.text(
    data.totais.credito.toString(),
    tableStartX + colWidths[0] + colWidths[1] + 2,
    yPosition
  );
  doc.text(
    data.totais.debito.toString(),
    tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2,
    yPosition
  );

  // Salvar o PDF
  const fileName = `movimentacao_cacau_${data.periodo.inicio.replace(
    /\//g,
    "-"
  )}_a_${data.periodo.fim.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}

// Função para gerar relatório unificado do fornecedor
export function generateUnifiedSupplierReportPDF(data: {
  fornecedor: {
    id: string;
    nome: string;
    documento: string;
    endereco: string | { rua?: string; cidade?: string; estado?: string };
  };
  periodo: { inicio: string; fim: string };
  dataEmissao: string;
  movimentacaoCacau: {
    movimentacoes: Array<{
      data: string;
      historico: string;
      credito: number;
      debito: number;
      saldo: number;
    }>;
    totais: { credito: number; debito: number; saldo: number };
  };
  movimentacaoFinanceira: {
    movimentacoes: Array<{
      data: string;
      historico: string;
      credito: number;
      debito: number;
      saldo: number;
    }>;
    totais: { credito: number; debito: number; saldo: number };
  };
  resumo: {
    cacau: { total: number; precoMedio: number; sacarias: number };
    financeiro: { saldo: number; totalCompras: number; totalPagamentos: number };
  };
}): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const fontSize = {
    small: 8,
    normal: 10,
    medium: 12,
    large: 14,
    xlarge: 16,
  };

  const colors = {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    gray: [128, 128, 128],
    lightGray: [200, 200, 200],
  };

  let yPosition = 20;

  // Cabeçalho da empresa
  doc.setFontSize(fontSize.xlarge);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont("helvetica", "bold");
  doc.text("UBATA CACAU", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 6;
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  const endereco = typeof data.fornecedor.endereco === "string"
    ? data.fornecedor.endereco
    : "RUA DOM EDUARDO - UBATA-BA";
  doc.text(endereco, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 15;

  // Informações do fornecedor
  doc.setFontSize(fontSize.large);
  doc.setFont("helvetica", "bold");
  doc.text(`FORNECEDOR: ${data.fornecedor.nome}`, 20, yPosition);

  yPosition += 8;
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  doc.text(`Documento: ${data.fornecedor.documento}`, 20, yPosition);

  yPosition += 6;
  doc.text(`Período: ${data.periodo.inicio} a ${data.periodo.fim}`, 20, yPosition);

  yPosition += 6;
  doc.text(`Emitido em: ${data.dataEmissao}`, 20, yPosition);

  yPosition += 20;

  // Movimento de Cacau
  doc.setFontSize(fontSize.medium);
  doc.setFont("helvetica", "bold");
  doc.text("MOVIMENTO DE CACAU", 20, yPosition);
  yPosition += 10;

  // Tabela de movimentação de cacau
  const tableStartX = 20;
  const tableWidth = pageWidth - 40;
  const colWidths = [25, 80, 25, 25, 25];

  // Cabeçalho da tabela
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(tableStartX, yPosition - 4, tableWidth, 8, "F");

  doc.setFontSize(fontSize.small);
  doc.setFont("helvetica", "bold");
  doc.text("Data", tableStartX + 2, yPosition);
  doc.text("Histórico", tableStartX + colWidths[0] + 2, yPosition);
  doc.text("Crédito", tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
  doc.text("Débito", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
  doc.text("Saldo", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

  yPosition += 8;

  // Dados da movimentação de cacau
  doc.setFont("helvetica", "normal");
  data.movimentacaoCacau.movimentacoes.forEach((mov) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(mov.data, tableStartX + 2, yPosition);
    // Quebrar histórico se muito longo
    const historico = mov.historico.length > 35 ? mov.historico.substring(0, 32) + "..." : mov.historico;
    doc.text(historico, tableStartX + colWidths[0] + 2, yPosition);
    doc.text(mov.credito > 0 ? `${mov.credito.toFixed(2)} kg` : "-", tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
    doc.text(mov.debito > 0 ? `${mov.debito.toFixed(2)} kg` : "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
    doc.text(`${mov.saldo.toFixed(2)} kg`, tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

    yPosition += 6;
  });

  // Totais cacau
  yPosition += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Totais", tableStartX + 2, yPosition);
  doc.text(`${data.movimentacaoCacau.totais.credito.toFixed(2)} kg`, tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
  doc.text(`${data.movimentacaoCacau.totais.debito.toFixed(2)} kg`, tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
  doc.text(`${data.movimentacaoCacau.totais.saldo.toFixed(2)} kg`, tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

  yPosition += 20;

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = 20;
  }

  // Movimento Financeiro
  doc.setFontSize(fontSize.medium);
  doc.setFont("helvetica", "bold");
  doc.text("MOVIMENTO FINANCEIRO", 20, yPosition);
  yPosition += 10;

  // Cabeçalho da tabela financeira
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(tableStartX, yPosition - 4, tableWidth, 8, "F");

  doc.setFontSize(fontSize.small);
  doc.setFont("helvetica", "bold");
  doc.text("Data", tableStartX + 2, yPosition);
  doc.text("Histórico", tableStartX + colWidths[0] + 2, yPosition);
  doc.text("Crédito", tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
  doc.text("Débito", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
  doc.text("Saldo", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

  yPosition += 8;

  // Dados da movimentação financeira
  doc.setFont("helvetica", "normal");
  data.movimentacaoFinanceira.movimentacoes.forEach((mov) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(mov.data, tableStartX + 2, yPosition);
    // Quebrar histórico se muito longo
    const historico = mov.historico.length > 35 ? mov.historico.substring(0, 32) + "..." : mov.historico;
    doc.text(historico, tableStartX + colWidths[0] + 2, yPosition);
    doc.text(mov.credito > 0 ? formatCurrency(mov.credito) : "-", tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
    doc.text(mov.debito > 0 ? formatCurrency(mov.debito) : "-", tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
    doc.text(formatCurrency(mov.saldo), tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

    yPosition += 6;
  });

  // Totais financeiros
  yPosition += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Totais", tableStartX + 2, yPosition);
  doc.text(formatCurrency(data.movimentacaoFinanceira.totais.credito), tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
  doc.text(formatCurrency(data.movimentacaoFinanceira.totais.debito), tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
  doc.text(formatCurrency(data.movimentacaoFinanceira.totais.saldo), tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition);

  // Salvar o PDF
  const fileName = `relatorio_unificado_${data.fornecedor.nome.replace(/\s+/g, "_")}_${data.periodo.inicio.replace(/\//g, "-")}_a_${data.periodo.fim.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}

// Função para gerar relatório financeiro em PDF
export function generateFinancialReportPDF(data: {
  tipo: string;
  titulo: string;
  periodo: { inicio: string; fim: string };
  metricas: any;
  dados: any[];
  resumo?: any;
}): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Configurações de fonte
  const fontSize = {
    small: 8,
    normal: 10,
    medium: 12,
    large: 14,
    xlarge: 16,
  };

  // Cores
  const colors = {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    gray: [128, 128, 128],
    lightGray: [200, 200, 200],
  };

  let yPosition = 20;

  // Cabeçalho da empresa
  doc.setFontSize(fontSize.xlarge);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont("helvetica", "bold");
  doc.text("UBATA CACAU", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 6;
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  doc.text("RUA DOM EDUARDO - UBATA-BA", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 15;

  // Título do relatório
  doc.setFontSize(fontSize.large);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont("helvetica", "bold");
  doc.text(data.titulo.toUpperCase(), pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 8;

  // Período
  doc.setFontSize(fontSize.normal);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Período: ${formatDate(data.periodo.inicio)} a ${formatDate(
      data.periodo.fim
    )}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  yPosition += 15;

  // Linha separadora
  doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Métricas principais (se disponíveis)
  if (data.metricas) {
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO EXECUTIVO:", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    const metricas = Object.entries(data.metricas);
    const colunas = 2;
    const larguraColuna = (pageWidth - 40) / colunas;

    for (let i = 0; i < metricas.length; i += colunas) {
      for (let j = 0; j < colunas && i + j < metricas.length; j++) {
        const [chave, valor] = metricas[i + j];
        const x = 20 + j * larguraColuna;
        const valorFormatado =
          typeof valor === "number" && chave.toLowerCase().includes("valor")
            ? formatCurrency(valor as number)
            : valor?.toString() || "N/A";

        doc.text(`${chave}: ${valorFormatado}`, x, yPosition);
      }
      yPosition += 6;
    }

    yPosition += 10;
  }

  // Dados do relatório
  if (data.dados && data.dados.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DETALHADOS:", 20, yPosition);
    yPosition += 8;

    // Cabeçalho da tabela
    const colunas = Object.keys(data.dados[0]);
    const larguraColuna = (pageWidth - 40) / colunas.length;

    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.rect(20, yPosition - 4, pageWidth - 40, 8, "F");

    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFontSize(fontSize.small);
    doc.setFont("helvetica", "bold");

    colunas.forEach((coluna, index) => {
      const x = 20 + index * larguraColuna + 2;
      doc.text(coluna, x, yPosition);
    });

    yPosition += 8;

    // Dados da tabela
    doc.setFont("helvetica", "normal");
    data.dados.slice(0, 20).forEach((item) => {
      // Limitar a 20 itens para caber na página
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      colunas.forEach((coluna, index) => {
        const x = 20 + index * larguraColuna + 2;
        const valor = item[coluna];
        const valorFormatado =
          typeof valor === "number" && coluna.toLowerCase().includes("valor")
            ? formatCurrency(valor)
            : valor?.toString() || "N/A";

        doc.text(valorFormatado, x, yPosition);
      });

      yPosition += 6;
    });

    if (data.dados.length > 20) {
      yPosition += 5;
      doc.setFont("helvetica", "italic");
      doc.text(`... e mais ${data.dados.length - 20} registros`, 20, yPosition);
    }
  }

  // Resumo final (se disponível)
  if (data.resumo) {
    yPosition += 15;
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO FINAL:", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    Object.entries(data.resumo).forEach(([chave, valor]) => {
      const valorFormatado =
        typeof valor === "number" && chave.toLowerCase().includes("valor")
          ? formatCurrency(valor as number)
          : valor?.toString() || "N/A";

      doc.text(`${chave}: ${valorFormatado}`, 20, yPosition);
      yPosition += 6;
    });
  }

  // Rodapé
  yPosition = pageHeight - 20;
  doc.setFontSize(fontSize.small);
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text(
    `Gerado em: ${formatDateTime(new Date())}`,
    pageWidth - 20,
    yPosition,
    {
      align: "right",
    }
  );

  // Salvar o PDF
  const fileName = `relatorio_${data.tipo}_${formatDate(new Date()).replace(
    /\//g,
    "-"
  )}.pdf`;
  doc.save(fileName);
}
