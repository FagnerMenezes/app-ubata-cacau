import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { fornecedoresHandlers, ticketsHandlers, comprasHandlers } from './handlers'

// Flag para ativar/desativar mocks
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_API_URL

// Função para simular resposta da API
function createMockResponse<T>(data: T, status: number = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosRequestConfig,
    request: {}
  }
}

// Função para simular erro da API
function createMockError(message: string, status: number = 400) {
  const error = new Error(message) as any
  error.response = {
    data: { message, success: false },
    status,
    statusText: status === 400 ? 'Bad Request' : status === 404 ? 'Not Found' : 'Error'
  }
  return error
}

// Interceptador de requisições para mocks
export function setupMockInterceptor() {
  if (!USE_MOCKS) {
    console.log('🔗 Using real API endpoints')
    return
  }

  console.log('🎭 Using mock API endpoints')

  // Interceptar requisições e responder com mocks
  axios.interceptors.request.use(async (config) => {
    const { method = 'get', url = '', data } = config

    try {
      // FORNECEDORES ROUTES
      if (url.includes('/fornecedores')) {
        let response

        if (method === 'get' && url.match(/^\/fornecedores$/)) {
          // GET /fornecedores
          const params = new URLSearchParams(url.split('?')[1] || '')
          const filters = Object.fromEntries(params.entries())
          response = await fornecedoresHandlers.getAll(filters)
        } else if (method === 'get' && url.match(/^\/fornecedores\/[^\/]+$/)) {
          // GET /fornecedores/:id
          const id = url.split('/').pop()!
          response = await fornecedoresHandlers.getById(id)
        } else if (method === 'get' && url.match(/^\/fornecedores\/[^\/]+\/stats$/)) {
          // GET /fornecedores/:id/stats
          const id = url.split('/')[2]
          response = await fornecedoresHandlers.getStats(id)
        } else if (method === 'post' && url.match(/^\/fornecedores$/)) {
          // POST /fornecedores
          response = await fornecedoresHandlers.create(data)
        } else if (method === 'put' && url.match(/^\/fornecedores\/[^\/]+$/)) {
          // PUT /fornecedores/:id
          const id = url.split('/').pop()!
          response = await fornecedoresHandlers.update(id, data)
        } else if (method === 'delete' && url.match(/^\/fornecedores\/[^\/]+$/)) {
          // DELETE /fornecedores/:id
          const id = url.split('/').pop()!
          response = await fornecedoresHandlers.delete(id)
        } else if (method === 'patch' && url.includes('/toggle-status')) {
          // PATCH /fornecedores/:id/toggle-status
          const id = url.split('/')[2]
          response = await fornecedoresHandlers.toggleStatus(id)
        }

        if (response) {
          throw createMockResponse(response)
        }
      }

      // TICKETS ROUTES
      if (url.includes('/tickets')) {
        let response

        if (method === 'get' && url.match(/^\/tickets$/)) {
          // GET /tickets
          const params = new URLSearchParams(url.split('?')[1] || '')
          const query = Object.fromEntries(params.entries())
          response = await ticketsHandlers.getAll(query)
        } else if (method === 'get' && url.match(/^\/tickets\/available$/)) {
          // GET /tickets/available
          response = await ticketsHandlers.getAvailable()
        } else if (method === 'get' && url.match(/^\/tickets\/stats$/)) {
          // GET /tickets/stats
          const params = new URLSearchParams(url.split('?')[1] || '')
          const fornecedorId = params.get('fornecedorId') || undefined
          response = await ticketsHandlers.getStats(fornecedorId)
        } else if (method === 'get' && url.match(/^\/tickets\/[^\/]+$/)) {
          // GET /tickets/:id
          const id = url.split('/').pop()!
          response = await ticketsHandlers.getById(id)
        } else if (method === 'post' && url.match(/^\/tickets$/)) {
          // POST /tickets
          response = await ticketsHandlers.create(data)
        } else if (method === 'post' && url.includes('/convert')) {
          // POST /tickets/:id/convert
          const id = url.split('/')[2]
          response = await ticketsHandlers.convertToCompra(id, data)
        } else if (method === 'put' && url.match(/^\/tickets\/[^\/]+$/)) {
          // PUT /tickets/:id
          const id = url.split('/').pop()!
          response = await ticketsHandlers.update(id, data)
        } else if (method === 'delete' && url.match(/^\/tickets\/[^\/]+$/)) {
          // DELETE /tickets/:id
          const id = url.split('/').pop()!
          response = await ticketsHandlers.delete(id)
        }

        if (response) {
          throw createMockResponse(response)
        }
      }

      // FORNECEDOR TICKETS ROUTES
      if (url.match(/^\/fornecedores\/[^\/]+\/tickets/)) {
        const fornecedorId = url.split('/')[2]
        const params = new URLSearchParams(url.split('?')[1] || '')
        const query = Object.fromEntries(params.entries())
        const response = await ticketsHandlers.getByFornecedor(fornecedorId, query)
        throw createMockResponse(response)
      }

      // COMPRAS ROUTES
      if (url.includes('/compras')) {
        console.log('🛒 COMPRAS ROUTE INTERCEPTED:', { method, url })
        let response

        if (method === 'get' && url.match(/^\/compras$/)) {
          // GET /compras
          console.log('🛒 GET /compras matched')
          const params = new URLSearchParams(url.split('?')[1] || '')
          const filters = Object.fromEntries(params.entries())
          response = await comprasHandlers.getAll(filters)
        } else if (method === 'get' && url.match(/^\/compras\/stats$/)) {
          // GET /compras/stats
          const params = new URLSearchParams(url.split('?')[1] || '')
          const periodo = params.get('periodo') || undefined
          response = await comprasHandlers.getStats(periodo)
        } else if (method === 'get' && url.match(/^\/compras\/[^\/]+$/)) {
          // GET /compras/:id
          const id = url.split('/').pop()!
          response = await comprasHandlers.getById(id)
        } else if (method === 'post' && url.match(/^\/compras$/)) {
          // POST /compras
          response = await comprasHandlers.create(data)
        } else if (method === 'post' && url.match(/^\/compras\/converter-ticket$/)) {
          // POST /compras/converter-ticket
          response = await comprasHandlers.create(data)
        } else if (method === 'put' && url.match(/^\/compras\/[^\/]+$/)) {
          // PUT /compras/:id
          const id = url.split('/').pop()!
          response = await comprasHandlers.update(id, data)
        } else if (method === 'delete' && url.match(/^\/compras\/[^\/]+$/)) {
          // DELETE /compras/:id
          const id = url.split('/').pop()!
          response = await comprasHandlers.delete(id)
        } else if (method === 'patch' && url.includes('/confirmar')) {
          // PATCH /compras/:id/confirmar
          const id = url.split('/')[2]
          response = await comprasHandlers.confirmar(id)
        } else if (method === 'patch' && url.includes('/entregar')) {
          // PATCH /compras/:id/entregar
          const id = url.split('/')[2]
          response = await comprasHandlers.marcarEntregue(id, data?.dataEntrega)
        } else if (method === 'patch' && url.includes('/cancelar')) {
          // PATCH /compras/:id/cancelar
          const id = url.split('/')[2]
          response = await comprasHandlers.cancelar(id, data?.motivo)
        }

        if (response) {
          throw createMockResponse(response)
        }
      }

    } catch (mockResponse) {
      // Se é uma resposta mock (não um erro real), retorna ela
      if (mockResponse && typeof mockResponse === 'object' && 'data' in mockResponse) {
        return Promise.reject({
          ...mockResponse,
          config,
          isAxiosError: false,
          isMockResponse: true
        })
      }
      // Se é um erro real dos handlers, transforma em erro de API
      throw createMockError((mockResponse as Error).message)
    }

    // Se chegou até aqui, não é uma rota mockada
    return config
  })

  // Interceptar respostas para tratar mocks
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Se é uma resposta mock, retorna como sucesso
      if (error.isMockResponse) {
        return Promise.resolve(error)
      }
      return Promise.reject(error)
    }
  )
}

// Função para resetar os dados dos mocks
export function resetMockData() {
  if (USE_MOCKS) {
    // Recriar instância do MockDatabase para resetar dados
    (window as any).__mockDB = null
    console.log('🔄 Mock data reset')
  }
}