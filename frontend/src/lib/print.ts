import type { Ticket } from '@/types/ticket'

export interface PrintOptions {
  width?: number // largura em mm (58 ou 80)
  autoprint?: boolean
  useThermalAPI?: boolean // usar API Labelary para impressão térmica real
}

// Função para validar e converter dados numéricos do ticket
function validateTicketData(ticket: Ticket): { pesoBruto: number; pesoLiquido: number } {
  const pesoBruto = Number(ticket.pesoBruto)
  const pesoLiquido = Number(ticket.pesoLiquido)
  
  if (isNaN(pesoBruto) || isNaN(pesoLiquido)) {
    throw new Error('Dados de peso inválidos no ticket')
  }
  
  if (pesoBruto < 0 || pesoLiquido < 0) {
    throw new Error('Pesos não podem ser negativos')
  }
  
  return { pesoBruto, pesoLiquido }
}

// Função para gerar ZPL (Zebra Programming Language) para impressoras térmicas
export function generateZPL(ticket: Ticket, width: number = 58): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR')
  const formatTime = (date: string) => new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  
  // Validar e garantir que os pesos sejam números
  const { pesoBruto, pesoLiquido } = validateTicketData(ticket)
  const diferenca = pesoBruto - pesoLiquido
  
  // Ajustar posições baseado na largura (58mm ou 80mm)
  const positions = width === 58 ? {
    title: { x: 50, y: 50 },
    line: { x: 20, y: 80 },
    id: { x: 20, y: 110 },
    date: { x: 20, y: 140 },
    supplier: { x: 20, y: 180 },
    doc: { x: 20, y: 210 },
    weights: { x: 20, y: 250 },
    status: { x: 20, y: 320 },
    obs: { x: 20, y: 350 },
    footer: { x: 50, y: 400 }
  } : {
    title: { x: 80, y: 50 },
    line: { x: 30, y: 80 },
    id: { x: 30, y: 110 },
    date: { x: 30, y: 140 },
    supplier: { x: 30, y: 180 },
    doc: { x: 30, y: 210 },
    weights: { x: 30, y: 250 },
    status: { x: 30, y: 320 },
    obs: { x: 30, y: 350 },
    footer: { x: 80, y: 400 }
  }

  return `^XA
^CF0,30
^FO${positions.title.x},${positions.title.y}^FDTICKET DE PESAGEM^FS
^FO${positions.line.x},${positions.line.y}^GB${width === 58 ? '200' : '300'},3,3^FS
^CF0,20
^FO${positions.id.x},${positions.id.y}^FDID: ${ticket.id.slice(0, 8)}^FS
^FO${positions.date.x},${positions.date.y}^FD${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}^FS
^FO${positions.line.x},${positions.line.y + 100}^GB${width === 58 ? '200' : '300'},1,1^FS
^FO${positions.supplier.x},${positions.supplier.y}^FDFornecedor: ${ticket.fornecedor?.nome || 'N/A'}^FS
^FO${positions.doc.x},${positions.doc.y}^FDDocumento: ${ticket.fornecedor?.documento || 'N/A'}^FS
^FO${positions.line.x},${positions.line.y + 170}^GB${width === 58 ? '200' : '300'},1,1^FS
^FO${positions.weights.x},${positions.weights.y}^FDPeso Bruto: ${pesoBruto.toFixed(2)} kg^FS
^FO${positions.weights.x},${positions.weights.y + 25}^FDPeso Liquido: ${pesoLiquido.toFixed(2)} kg^FS
^FO${positions.weights.x},${positions.weights.y + 50}^FDDiferenca: ${diferenca.toFixed(2)} kg^FS
^FO${positions.line.x},${positions.line.y + 240}^GB${width === 58 ? '200' : '300'},1,1^FS
^FO${positions.status.x},${positions.status.y}^FDStatus: ${ticket.status}^FS
${ticket.observacoes ? `^FO${positions.obs.x},${positions.obs.y}^FDObs: ${ticket.observacoes}^FS` : ''}
^FO${positions.line.x},${positions.line.y + 320}^GB${width === 58 ? '200' : '300'},1,1^FS
^CF0,25
^FO${positions.footer.x},${positions.footer.y}^FDObrigado!^FS
^XZ`
}

// Função para impressão via API térmica (Labelary)
async function printViaThermalAPI(ticket: Ticket, width: number = 58): Promise<void> {
  try {
    // Validar dados do ticket antes de gerar ZPL
    validateTicketData(ticket)
    
    const zpl = generateZPL(ticket, width)
    
    // Configurar FormData para envio
    const formData = new FormData()
    formData.append('file', new Blob([zpl], { type: 'text/plain' }), 'ticket.zpl')
    
    // Fazer requisição para API Labelary
    const response = await fetch(`http://api.labelary.com/v1/printers/${width === 58 ? '8dpmm' : '6dpmm'}/labels/4x6/0/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/pdf'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Erro na API Labelary: ${response.status} - ${response.statusText}`)
    }
    
    // Converter resposta para blob PDF
    const pdfBlob = await response.blob()
    
    if (pdfBlob.size === 0) {
      throw new Error('PDF gerado está vazio')
    }
    
    // Criar URL para o PDF
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    // Abrir janela de impressão com PDF
    const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
    
    if (!printWindow) {
      // Limpar URL se janela não abrir
      URL.revokeObjectURL(pdfUrl)
      throw new Error('Bloqueador de pop-up ativo. Permita pop-ups para imprimir via API térmica.')
    }
    
    // Adicionar controle de eventos da janela
    let windowClosed = false
    
    // Detectar quando usuário fecha a janela manualmente
    const checkClosed = setInterval(() => {
      if (printWindow.closed) {
        windowClosed = true
        clearInterval(checkClosed)
        URL.revokeObjectURL(pdfUrl)
      }
    }, 1000)
    
    // Configurar auto-impressão e limpeza
    printWindow.onload = () => {
      // Aguardar um pouco mais para garantir que o PDF carregou completamente
      setTimeout(() => {
        if (!windowClosed) {
          try {
            printWindow.print()
          } catch (printError) {
            console.warn('Erro ao auto-imprimir:', printError)
          }
        }
        
        // Dar mais tempo para visualização antes de fechar (10 segundos)
        setTimeout(() => {
          if (!windowClosed) {
            URL.revokeObjectURL(pdfUrl)
            // Só fechar se o usuário não fechou manualmente
            if (!printWindow.closed) {
              printWindow.close()
            }
          }
          clearInterval(checkClosed)
        }, 10000) // 10 segundos para visualização
      }, 1000) // 1 segundo para carregar o PDF
    }
    
    // Limpar URL em caso de erro na janela
    printWindow.onerror = () => {
      windowClosed = true
      clearInterval(checkClosed)
      URL.revokeObjectURL(pdfUrl)
    }
    
  } catch (error) {
    console.error('Erro na impressão térmica:', error)
    
    // Melhorar mensagens de erro para o usuário
    let userMessage = 'Erro na impressão térmica: '
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMessage += 'Problema de conexão com a API de impressão. Verifique sua conexão com a internet.'
    } else if (error instanceof Error) {
      if (error.message.includes('Labelary')) {
        userMessage += 'Serviço de impressão temporariamente indisponível.'
      } else if (error.message.includes('pop-up')) {
        userMessage += error.message
      } else {
        userMessage += 'Falha na geração do ticket. Tente novamente.'
      }
    } else {
      userMessage += 'Erro desconhecido. Tente novamente ou use impressão tradicional.'
    }
    
    // Mostrar erro para o usuário
    alert(userMessage)
    
    // Re-lançar erro para permitir fallback
    throw error
  }
}

export function formatTicketForPrint(ticket: Ticket, options: PrintOptions = {}): string {
  const { width = 58 } = options
  const lineLength = width === 58 ? 32 : 48
  
  const center = (text: string) => text.padStart((lineLength + text.length) / 2).padEnd(lineLength)
  const line = () => '='.repeat(lineLength)
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR')
  const formatTime = (date: string) => new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  
  // Função para quebrar texto longo em múltiplas linhas
  const wrapText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    const words = text.split(' ')
    const lines = []
    let currentLine = ''
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines.join('\n')
  }
  
  const supplierName = wrapText(ticket.fornecedor?.nome || 'N/A', lineLength - 12)
  const document = ticket.fornecedor?.documento || 'N/A'
  const observations = ticket.observacoes ? wrapText(ticket.observacoes, lineLength - 5) : ''
  
  return `
${center('TICKET DE PESAGEM')}
${line()}
ID: ${ticket.id.slice(0, 8)}
Data: ${formatDate(ticket.createdAt)}
Hora: ${formatTime(ticket.createdAt)}
${line()}
Fornecedor: 
${supplierName}
Documento: ${document}
${line()}
Peso Bruto:   ${ticket.pesoBruto.toFixed(2).padStart(8)} kg
Peso Liquido: ${ticket.pesoLiquido.toFixed(2).padStart(8)} kg
Diferenca:    ${(ticket.pesoBruto - ticket.pesoLiquido).toFixed(2).padStart(8)} kg
${line()}
Status: ${ticket.status}
${observations ? `Observacoes:\n${observations}` : ''}
${line()}
${center('Obrigado pela preferencia!')}
${center('www.ubatan-cacau.com.br')}
`.trim()
}

export function printTicket(ticket: Ticket, options: PrintOptions = {}): void {
  const { useThermalAPI = false } = options
  
  // Se usar API térmica, chamar função específica
  if (useThermalAPI) {
    printViaThermalAPI(ticket, options.width)
      .then(() => {
        console.log('Impressão térmica enviada com sucesso')
      })
      .catch((error) => {
        console.error('Erro na impressão térmica:', error)
        // Fallback para impressão tradicional em caso de erro
        printTraditional(ticket, options)
      })
    return
  }
  
  // Impressão tradicional (navegador)
  printTraditional(ticket, options)
}

// Função para impressão tradicional via navegador
function printTraditional(ticket: Ticket, options: PrintOptions = {}): void {
  const content = formatTicketForPrint(ticket, options)
  
  // Criar janela de impressão otimizada para impressora térmica
  const printWindow = window.open('', '_blank', 'width=300,height=600')
  
  if (!printWindow) {
    alert('Bloqueador de pop-up ativo. Permita pop-ups para imprimir.')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket ${ticket.id.slice(0, 8)}</title>
      <style>
        @media print {
          @page { 
            size: ${options.width || 58}mm auto; 
            margin: 0; 
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          margin: 0;
          padding: 5mm;
          white-space: pre-line;
        }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `)
  
  printWindow.document.close()
  
  // Auto-imprimir se solicitado
  if (options.autoprint) {
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  } else {
    printWindow.focus()
  }
}