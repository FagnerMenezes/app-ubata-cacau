import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  systemTheme: Theme
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSystemTheme: (theme: Theme) => void
  applyTheme: (theme: Theme) => void
}

type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      theme: 'light',
      systemTheme: 'light',

      // Ações
      setTheme: (theme: Theme) => {
        const { applyTheme } = get()
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const { theme, setTheme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
      },

      setSystemTheme: (systemTheme: Theme) => {
        set({ systemTheme })
      },

      applyTheme: (theme: Theme) => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
)

// Hook para detectar mudanças no tema do sistema
export const useSystemTheme = () => {
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)

  // Detectar tema do sistema
  const detectSystemTheme = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDark ? 'dark' : 'light'
  }

  // Configurar listener para mudanças no tema do sistema
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light'
      setSystemTheme(systemTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    // Definir tema inicial do sistema
    setSystemTheme(detectSystemTheme())

    return () => mediaQuery.removeEventListener('change', handleChange)
  }

  return { detectSystemTheme, setupSystemThemeListener }
}