import { MockDatabase } from './data'
import type { Fornecedor, CreateFornecedorData, UpdateFornecedorData } from '@/types/fornecedor'
import type { Ticket, CreateTicketInput, UpdateTicketInput } from '@/types/ticket'
import type { Compra, CreateCompraData, UpdateCompraData } from '@/types/compra'

const db = MockDatabase.getInstance()

// Utility function para gerar ID único
const generateId = () => Math.random().toString(36).substr(2, 9)

// Utility function para simular delay de rede
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Utility function para paginar resultados
function paginate<T>(items: T[], page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const data = items.slice(offset, offset + limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  }
}

// FORNECEDORES HANDLERS
export const fornecedoresHandlers = {
  async getAll(filters: any = {}) {
    await delay()
    let fornecedores = db.getFornecedores()

    // Aplicar filtros
    if (filters.search) {
      const search = filters.search.toLowerCase()
      fornecedores = fornecedores.filter(f =>
        f.nome.toLowerCase().includes(search) ||
        f.contato?.email?.toLowerCase().includes(search) ||
        f.documento.includes(search)
      )
    }

    if (filters.status) {
      fornecedores = fornecedores.filter(f => f.status === filters.status)
    }

    if (filters.tipoDocumento) {
      fornecedores = fornecedores.filter(f => f.tipoDocumento === filters.tipoDocumento)
    }

    // Aplicar ordenação
    if (filters.sortBy) {
      fornecedores.sort((a, b) => {
        const aVal = (a as any)[filters.sortBy]
        const bVal = (b as any)[filters.sortBy]

        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }

    return paginate(fornecedores, filters.page, filters.limit)
  },

  async getById(id: string) {
    await delay()
    const fornecedor = db.getFornecedorById(id)
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado')
    }
    return { data: fornecedor }
  },

  async create(data: CreateFornecedorData) {
    await delay()

    console.log('🔧 Mock Handler - Dados recebidos:', data)

    // Validação de documento único
    const existing = db.getFornecedores().find(f => f.documento === data.documento)
    if (existing) {
      throw new Error('Já existe um fornecedor com este documento')
    }

    const newFornecedor: Fornecedor = {
      id: generateId(),
      ...data,
      qualidadeMedia: 0,
      totalCompras: 0,
      valorTotal: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('🔧 Mock Handler - Fornecedor criado:', newFornecedor)

    db.addFornecedor(newFornecedor)
    return { data: newFornecedor }
  },

  async update(id: string, data: UpdateFornecedorData) {
    await delay()

    // Validação de documento único (se mudou)
    if (data.documento) {
      const existing = db.getFornecedores().find(f => f.documento === data.documento && f.id !== id)
      if (existing) {
        throw new Error('Já existe um fornecedor com este documento')
      }
    }

    const updated = db.updateFornecedor(id, data)
    if (!updated) {
      throw new Error('Fornecedor não encontrado')
    }
    return { data: updated }
  },

  async delete(id: string) {
    await delay()

    // Verificar se há tickets associados
    const tickets = db.getTicketsByFornecedor(id)
    if (tickets.length > 0) {
      throw new Error('Não é possível excluir fornecedor com tickets associados')
    }

    const deleted = db.deleteFornecedor(id)
    if (!deleted) {
      throw new Error('Fornecedor não encontrado')
    }
    return { data: null }
  },

  async toggleStatus(id: string) {
    await delay()
    const fornecedor = db.getFornecedorById(id)
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado')
    }
    // Campo status não existe no backend - operação não suportada
    throw new Error('Operação não suportada - campo status não existe')
  },

  async getStats(id: string) {
    await delay()
    const fornecedor = db.getFornecedorById(id)
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado')
    }

    const tickets = db.getTicketsByFornecedor(id)
    const compras = db.getCompras().filter(c => c.fornecedorId === id)

    return {
      data: {
        totalTickets: tickets.length,
        ticketsPendentes: tickets.filter(t => t.status === 'PENDENTE').length,
        ticketsConvertidos: tickets.filter(t => t.status === 'CONVERTIDO').length,
        totalCompras: compras.length,
        valorTotal: compras.reduce((acc, c) => acc + c.valorTotal, 0),
        qualidadeMedia: compras.length > 0 ? compras.reduce((acc, c) => acc + c.qualidade, 0) / compras.length : 0
      }
    }
  }
}

// TICKETS HANDLERS
export const ticketsHandlers = {
  async getAll(query: any = {}) {
    await delay()
    let tickets = db.getTickets()

    // Aplicar filtros
    if (query.fornecedorId) {
      tickets = tickets.filter(t => t.fornecedorId === query.fornecedorId)
    }

    if (query.status) {
      tickets = tickets.filter(t => t.status === query.status)
    }

    if (query.dataInicio) {
      tickets = tickets.filter(t => new Date(t.createdAt) >= new Date(query.dataInicio))
    }

    if (query.dataFim) {
      tickets = tickets.filter(t => new Date(t.createdAt) <= new Date(query.dataFim))
    }

    const result = paginate(tickets, query.page, query.limit)
    return {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages
    }
  },

  async getById(id: string) {
    await delay()
    const ticket = db.getTicketById(id)
    if (!ticket) {
      throw new Error('Ticket não encontrado')
    }
    return { data: ticket }
  },

  async getAvailable() {
    await delay()
    const tickets = db.getAvailableTickets()
    return { data: tickets }
  },

  async create(data: CreateTicketInput) {
    await delay()

    // Validar se fornecedor existe
    const fornecedor = db.getFornecedorById(data.fornecedorId)
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado')
    }


    const newTicket: Ticket = {
      id: generateId(),
      ...data,
      status: 'PENDENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fornecedor: {
        id: fornecedor.id,
        nome: fornecedor.nome,
        documento: fornecedor.documento
      }
    }

    db.addTicket(newTicket)
    return { data: newTicket }
  },

  async update(id: string, data: UpdateTicketInput) {
    await delay()

    // Validar se fornecedor existe (se mudou)
    if (data.fornecedorId) {
      const fornecedor = db.getFornecedorById(data.fornecedorId)
      if (!fornecedor) {
        throw new Error('Fornecedor não encontrado')
      }

      // Atualizar dados do fornecedor no ticket
      data = {
        ...data,
        fornecedor: {
          id: fornecedor.id,
          nome: fornecedor.nome,
          documento: fornecedor.documento
        }
      } as any
    }

    const updated = db.updateTicket(id, data)
    if (!updated) {
      throw new Error('Ticket não encontrado')
    }
    return { data: updated }
  },

  async delete(id: string) {
    await delay()

    // Verificar se ticket não está convertido em compra
    const ticket = db.getTicketById(id)
    if (ticket?.status === 'CONVERTIDO') {
      throw new Error('Não é possível excluir ticket já convertido em compra')
    }

    const deleted = db.deleteTicket(id)
    if (!deleted) {
      throw new Error('Ticket não encontrado')
    }
    return { data: null }
  },

  async convertToCompra(ticketId: string, compraData: { precoPorKg: number; observacoes?: string }) {
    await delay()

    const ticket = db.getTicketById(ticketId)
    if (!ticket) {
      throw new Error('Ticket não encontrado')
    }

    if (ticket.status === 'CONVERTIDO') {
      throw new Error('Ticket já foi convertido em compra')
    }

    // Criar compra
    const newCompra: Compra = {
      id: generateId(),
      ticketId: ticket.id,
      fornecedorId: ticket.fornecedorId,
      dataCompra: new Date().toISOString(),
      precoPorKg: compraData.precoPorKg,
      valorTotal: ticket.pesoLiquido * compraData.precoPorKg,
      qualidade: 8, // Valor padrão
      observacoes: compraData.observacoes,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fornecedor: ticket.fornecedor!,
      ticket: {
        id: ticket.id,
        pesoBruto: ticket.pesoBruto,
        pesoLiquido: ticket.pesoLiquido,
        observacoes: ticket.observacoes
      }
    }

    db.addCompra(newCompra)

    // Retornar ticket atualizado
    const updatedTicket = db.getTicketById(ticketId)
    return { data: updatedTicket }
  },

  async getByFornecedor(fornecedorId: string, query: any = {}) {
    await delay()
    return this.getAll({ ...query, fornecedorId })
  },

  async getStats(fornecedorId?: string) {
    await delay()
    let tickets = db.getTickets()

    if (fornecedorId) {
      tickets = tickets.filter(t => t.fornecedorId === fornecedorId)
    }

    return {
      data: {
        total: tickets.length,
        pendentes: tickets.filter(t => t.status === 'PENDENTE').length,
        convertidos: tickets.filter(t => t.status === 'CONVERTIDO').length,
        pesoTotal: tickets.reduce((acc, t) => acc + t.pesoLiquido, 0)
      }
    }
  }
}

// COMPRAS HANDLERS
export const comprasHandlers = {
  async getAll(filters: any = {}) {
    await delay()
    let compras = db.getCompras()

    // Aplicar filtros
    if (filters.search) {
      const search = filters.search.toLowerCase()
      compras = compras.filter(c =>
        c.fornecedor.nome.toLowerCase().includes(search) ||
        c.numeroNota?.toLowerCase().includes(search)
      )
    }

    if (filters.fornecedorId) {
      compras = compras.filter(c => c.fornecedorId === filters.fornecedorId)
    }

    if (filters.ticketId) {
      compras = compras.filter(c => c.ticketId === filters.ticketId)
    }

    if (filters.status) {
      compras = compras.filter(c => c.status === filters.status)
    }

    if (filters.dataInicio) {
      compras = compras.filter(c => new Date(c.dataCompra) >= new Date(filters.dataInicio))
    }

    if (filters.dataFim) {
      compras = compras.filter(c => new Date(c.dataCompra) <= new Date(filters.dataFim))
    }

    if (filters.qualidadeMin) {
      compras = compras.filter(c => c.qualidade >= filters.qualidadeMin)
    }

    if (filters.qualidadeMax) {
      compras = compras.filter(c => c.qualidade <= filters.qualidadeMax)
    }

    // Aplicar ordenação
    if (filters.sortBy) {
      compras.sort((a, b) => {
        const aVal = (a as any)[filters.sortBy]
        const bVal = (b as any)[filters.sortBy]

        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }

    return paginate(compras, filters.page, filters.limit)
  },

  async getById(id: string) {
    await delay()
    const compra = db.getCompraById(id)
    if (!compra) {
      throw new Error('Compra não encontrada')
    }
    return { data: compra }
  },

  async create(data: CreateCompraData) {
    await delay()

    // Validar se ticket existe e está disponível
    const ticket = db.getTicketById(data.ticketId)
    if (!ticket) {
      throw new Error('Ticket não encontrado')
    }

    if (ticket.status === 'CONVERTIDO') {
      throw new Error('Este ticket já foi convertido em compra')
    }

    const fornecedor = db.getFornecedorById(ticket.fornecedorId)
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado')
    }


    // Validar qualidade
    if (data.qualidade < 1 || data.qualidade > 10) {
      throw new Error('Qualidade deve estar entre 1 e 10')
    }

    // Validar preço
    if (data.precoPorKg <= 0) {
      throw new Error('Preço por kg deve ser maior que zero')
    }

    const newCompra: Compra = {
      id: generateId(),
      ticketId: data.ticketId,
      fornecedorId: ticket.fornecedorId,
      dataCompra: new Date().toISOString(),
      precoPorKg: data.precoPorKg,
      valorTotal: ticket.pesoLiquido * data.precoPorKg,
      qualidade: data.qualidade,
      observacoes: data.observacoes,
      status: 'pendente',
      numeroNota: data.numeroNota,
      dataEntrega: data.dataEntrega,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fornecedor: ticket.fornecedor!,
      ticket: {
        id: ticket.id,
        pesoBruto: ticket.pesoBruto,
        pesoLiquido: ticket.pesoLiquido,
        observacoes: ticket.observacoes
      }
    }

    db.addCompra(newCompra)
    return { data: newCompra }
  },

  async update(id: string, data: UpdateCompraData) {
    await delay()

    const updated = db.updateCompra(id, data)
    if (!updated) {
      throw new Error('Compra não encontrada')
    }
    return { data: updated }
  },

  async delete(id: string) {
    await delay()

    const deleted = db.deleteCompra(id)
    if (!deleted) {
      throw new Error('Compra não encontrada')
    }
    return { data: null }
  },

  async confirmar(id: string) {
    await delay()

    const updated = db.updateCompra(id, { status: 'confirmada' })
    if (!updated) {
      throw new Error('Compra não encontrada')
    }
    return { data: updated }
  },

  async marcarEntregue(id: string, dataEntrega?: string) {
    await delay()

    const updated = db.updateCompra(id, {
      status: 'entregue',
      dataEntrega: dataEntrega || new Date().toISOString()
    })
    if (!updated) {
      throw new Error('Compra não encontrada')
    }
    return { data: updated }
  },

  async cancelar(id: string, motivo?: string) {
    await delay()

    const updated = db.updateCompra(id, {
      status: 'cancelada',
      observacoes: motivo ? `${updated?.observacoes || ''}\nMotivo do cancelamento: ${motivo}` : updated?.observacoes
    })
    if (!updated) {
      throw new Error('Compra não encontrada')
    }
    return { data: updated }
  },

  async getStats(periodo?: string) {
    await delay()
    const compras = db.getCompras()

    return {
      data: {
        totalCompras: compras.length,
        pesoTotal: compras.reduce((acc, c) => acc + c.ticket.pesoLiquido, 0),
        valorTotal: compras.reduce((acc, c) => acc + c.valorTotal, 0),
        qualidadeMedia: compras.length > 0 ? compras.reduce((acc, c) => acc + c.qualidade, 0) / compras.length : 0,
        comprasPorMes: [] // Implementar se necessário
      }
    }
  }
}