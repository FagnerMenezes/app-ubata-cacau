export { setupMockInterceptor, resetMockData } from './interceptor'
export { MockDatabase } from './data'
export * from './handlers'

// Auto-inicialização dos mocks se habilitado
import { setupMockInterceptor } from './interceptor'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_API_URL

console.log('🔧 Mock configuration:', {
  VITE_USE_MOCKS: import.meta.env.VITE_USE_MOCKS,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  USE_MOCKS
})

if (USE_MOCKS) {
  console.log('🔧 Setting up mock interceptor...')
  setupMockInterceptor()
}