import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/repositories/storage'

const THEME_KEY = 'theme'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('light')

  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    storage.set(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function applyTheme(themeValue: Theme) {
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function initTheme() {
    // Try to load from storage
    const savedTheme = storage.get<Theme>(THEME_KEY)
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme(theme.value)
  }

  // Initialize on store creation
  initTheme()

  // Watch for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly set a theme
      if (!storage.get<Theme>(THEME_KEY)) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme(theme.value)
      }
    })
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
})
