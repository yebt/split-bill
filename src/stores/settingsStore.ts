import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/repositories/storage'

const SETTINGS_KEY = 'app-settings'

export interface AppSettings {
  currency: string
  geminiApiToken: string
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  geminiApiToken: '',
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  // Getters
  const currency = computed(() => settings.value.currency)
  const geminiApiToken = computed(() => settings.value.geminiApiToken)
  const hasGeminiToken = computed(() => !!settings.value.geminiApiToken.trim())

  // Actions
  function loadSettings() {
    const saved = storage.get<AppSettings>(SETTINGS_KEY)
    if (saved) {
      settings.value = { ...DEFAULT_SETTINGS, ...saved }
    }
  }

  function saveSettings() {
    storage.set(SETTINGS_KEY, settings.value)
  }

  function setCurrency(newCurrency: string) {
    settings.value.currency = newCurrency
    saveSettings()
  }

  function setGeminiApiToken(token: string) {
    settings.value.geminiApiToken = token
    saveSettings()
  }

  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveSettings()
  }

  // Initialize on store creation
  loadSettings()

  return {
    settings,
    currency,
    geminiApiToken,
    hasGeminiToken,
    setCurrency,
    setGeminiApiToken,
    updateSettings,
    resetSettings,
  }
})
