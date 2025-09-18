import type { Fornecedor } from '@/types/fornecedor'
import type { Ticket } from '@/types/ticket'
import type { Compra } from '@/types/compra'

// Mock data para Fornecedores
export const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    nome: 'João Silva',
    documento: '123.456.789-00',
    endereco: {
      rua: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    contato: {
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      whatsapp: '(11) 99999-9999'
    },
    tipoDocumento: 'CPF',
    qualidadeMedia: 8.5,
    totalCompras: 15,
    valorTotal: 45000.00,
    ultimaCompra: '2024-01-15T10:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    documento: '987.654.321-00',
    endereco: {
      rua: 'Av. Principal, 456',
      cidade: 'Santos',
      estado: 'SP',
      cep: '11000-000'
    },
    contato: {
      email: 'maria.santos@email.com',
      telefone: '(11) 88888-8888',
      telefoneSecundario: '(11) 77777-7777'
    },
    tipoDocumento: 'CPF',
    qualidadeMedia: 9.2,
    totalCompras: 22,
    valorTotal: 68000.00,
    ultimaCompra: '2024-01-10T14:20:00Z',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    nome: 'Fazenda Cacau Ouro',
    documento: '12.345.678/0001-90',
    endereco: {
      rua: 'Estrada Rural, Km 15',
      cidade: 'Ilhéus',
      estado: 'BA',
      cep: '45650-000'
    },
    contato: {
      email: 'contato@fazendacacauouro.com.br',
      telefone: '(75) 3333-3333'
    },
    fazenda: 'Fazenda Cacau Ouro',
    tipoDocumento: 'CNPJ',
    qualidadeMedia: 9.8,
    totalCompras: 35,
    valorTotal: 125000.00,
    ultimaCompra: '2024-01-20T09:15:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    nome: 'Pedro Oliveira',
    documento: '456.789.123-00',
    endereco: {
      rua: 'Rua do Cacau, 789',
      cidade: 'Itabuna',
      estado: 'BA',
      cep: '45600-000'
    },
    contato: {
      email: 'pedro.oliveira@email.com',
      telefone: '(75) 7777-7777'
    },
    tipoDocumento: 'CPF',
    qualidadeMedia: 7.2,
    totalCompras: 8,
    valorTotal: 18000.00,
    ultimaCompra: '2023-12-05T16:45:00Z',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-12-05T16:45:00Z'
  }
]

// Mock data para Tickets
export const mockTickets: Ticket[] = [
  {
    id: 't1',
    fornecedorId: '1',
    pesoBruto: 120.5,
    pesoLiquido: 115.2,
    observacoes: 'Cacau de qualidade premium',
    status: 'PENDENTE',
    createdAt: '2024-01-21T08:00:00Z',
    updatedAt: '2024-01-21T08:00:00Z',
    fornecedor: {
      id: '1',
      nome: 'João Silva',
      documento: '123.456.789-00'
    }
  },
  {
    id: 't2',
    fornecedorId: '2',
    pesoBruto: 85.7,
    pesoLiquido: 82.1,
    observacoes: 'Cacau bem seco',
    status: 'PENDENTE',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    fornecedor: {
      id: '2',
      nome: 'Maria Santos',
      documento: '987.654.321-00'
    }
  },
  {
    id: 't3',
    fornecedorId: '3',
    pesoBruto: 200.0,
    pesoLiquido: 195.5,
    observacoes: 'Lote especial - qualidade superior',
    status: 'CONVERTIDO',
    createdAt: '2024-01-19T10:15:00Z',
    updatedAt: '2024-01-19T12:30:00Z',
    fornecedor: {
      id: '3',
      nome: 'Fazenda Cacau Ouro',
      documento: '12.345.678/0001-90'
    },
    compra: {
      id: 'c1',
      precoPorKg: 28.50,
      valorTotal: 5572.75
    }
  },
  {
    id: 't4',
    fornecedorId: '1',
    pesoBruto: 95.3,
    pesoLiquido: 91.8,
    observacoes: null,
    status: 'PENDENTE',
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    fornecedor: {
      id: '1',
      nome: 'João Silva',
      documento: '123.456.789-00'
    }
  }
]

// Mock data para Compras
export const mockCompras: Compra[] = [
  {
    id: 'c1',
    ticketId: 't3',
    fornecedorId: '3',
    dataCompra: '2024-01-19T12:30:00Z',
    precoPorKg: 28.50,
    valorTotal: 5572.75,
    qualidade: 9,
    observacoes: 'Excelente qualidade',
    status: 'confirmada',
    numeroNota: 'NF-001',
    createdAt: '2024-01-19T12:30:00Z',
    updatedAt: '2024-01-19T12:30:00Z',
    fornecedor: {
      id: '3',
      nome: 'Fazenda Cacau Ouro',
      documento: '12.345.678/0001-90'
    },
    ticket: {
      id: 't3',
      pesoBruto: 200.0,
      pesoLiquido: 195.5,
      observacoes: 'Lote especial - qualidade superior'
    }
  }
]

// Estado interno dos mocks para simular persistência durante a sessão
export class MockDatabase {
  private static instance: MockDatabase
  private fornecedores: Fornecedor[]
  private tickets: Ticket[]
  private compras: Compra[]

  private constructor() {
    this.fornecedores = [...mockFornecedores]
    this.tickets = [...mockTickets]
    this.compras = [...mockCompras]
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase()
    }
    return MockDatabase.instance
  }

  // Fornecedores
  getFornecedores(): Fornecedor[] {
    return [...this.fornecedores]
  }

  getFornecedorById(id: string): Fornecedor | undefined {
    return this.fornecedores.find(f => f.id === id)
  }

  addFornecedor(fornecedor: Fornecedor): void {
    this.fornecedores.push(fornecedor)
  }

  updateFornecedor(id: string, updates: Partial<Fornecedor>): Fornecedor | undefined {
    const index = this.fornecedores.findIndex(f => f.id === id)
    if (index !== -1) {
      this.fornecedores[index] = { ...this.fornecedores[index], ...updates, updatedAt: new Date().toISOString() }
      return this.fornecedores[index]
    }
    return undefined
  }

  deleteFornecedor(id: string): boolean {
    const index = this.fornecedores.findIndex(f => f.id === id)
    if (index !== -1) {
      this.fornecedores.splice(index, 1)
      return true
    }
    return false
  }

  // Tickets
  getTickets(): Ticket[] {
    return [...this.tickets]
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(t => t.id === id)
  }

  getTicketsByFornecedor(fornecedorId: string): Ticket[] {
    return this.tickets.filter(t => t.fornecedorId === fornecedorId)
  }

  getAvailableTickets(): Ticket[] {
    return this.tickets.filter(t => t.status === 'PENDENTE')
  }

  addTicket(ticket: Ticket): void {
    this.tickets.push(ticket)
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
    const index = this.tickets.findIndex(t => t.id === id)
    if (index !== -1) {
      this.tickets[index] = { ...this.tickets[index], ...updates, updatedAt: new Date().toISOString() }
      return this.tickets[index]
    }
    return undefined
  }

  deleteTicket(id: string): boolean {
    const index = this.tickets.findIndex(t => t.id === id)
    if (index !== -1) {
      this.tickets.splice(index, 1)
      return true
    }
    return false
  }

  // Compras
  getCompras(): Compra[] {
    return [...this.compras]
  }

  getCompraById(id: string): Compra | undefined {
    return this.compras.find(c => c.id === id)
  }

  addCompra(compra: Compra): void {
    this.compras.push(compra)
    // Atualizar status do ticket para CONVERTIDO
    const ticket = this.getTicketById(compra.ticketId)
    if (ticket) {
      this.updateTicket(ticket.id, { status: 'CONVERTIDO', compra: { id: compra.id, precoPorKg: compra.precoPorKg, valorTotal: compra.valorTotal } })
    }
  }

  updateCompra(id: string, updates: Partial<Compra>): Compra | undefined {
    const index = this.compras.findIndex(c => c.id === id)
    if (index !== -1) {
      this.compras[index] = { ...this.compras[index], ...updates, updatedAt: new Date().toISOString() }
      return this.compras[index]
    }
    return undefined
  }

  deleteCompra(id: string): boolean {
    const index = this.compras.findIndex(c => c.id === id)
    if (index !== -1) {
      const compra = this.compras[index]
      this.compras.splice(index, 1)
      // Reverter status do ticket para PENDENTE
      const ticket = this.getTicketById(compra.ticketId)
      if (ticket) {
        this.updateTicket(ticket.id, { status: 'PENDENTE', compra: undefined })
      }
      return true
    }
    return false
  }
}