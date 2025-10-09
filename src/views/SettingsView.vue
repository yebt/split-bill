<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSquadStore } from '@/stores/squadStore'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const squadStore = useSquadStore()

// Currency settings
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
]

const selectedCurrency = ref(settingsStore.currency)

// Gemini API Token
const showTokenModal = ref(false)
const geminiToken = ref(settingsStore.geminiApiToken)
const showToken = ref(false)

// Import/Export
const importInput = ref<HTMLInputElement>()
const showResetConfirm = ref(false)

// Theme
const isDarkMode = computed(() => themeStore.theme === 'dark')

function handleCurrencyChange() {
  settingsStore.setCurrency(selectedCurrency.value)
}

function handleSaveToken() {
  settingsStore.setGeminiApiToken(geminiToken.value)
  showTokenModal.value = false
}

function handleExport() {
  const data = squadStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `squad-bill-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  importInput.value?.click()
}

function handleImportFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result as string
      squadStore.importData(data)
      alert('Data imported successfully!')
    } catch (error) {
      alert('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  reader.readAsText(file)

  // Reset input
  target.value = ''
}

function handleResetSettings() {
  settingsStore.resetSettings()
  selectedCurrency.value = settingsStore.currency
  geminiToken.value = settingsStore.geminiApiToken
  showResetConfirm.value = false
}

function goBack() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="min-h-lvh">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <BaseButton variant="ghost" size="sm" @click="goBack">
            <div class="i-lucide-arrow-left text-lg" />
          </BaseButton>
          <div class="i-lucide-settings text-3xl text-blue-600 dark:text-blue-400" />
          <h1 class="text-2xl font-bold">Settings</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-3xl px-4 py-6">
      <div class="space-y-6">
        <!-- Appearance Section -->
        <BaseCard>
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-palette text-2xl text-blue-600 dark:text-blue-400" />
            <h2 class="text-xl font-semibold">Appearance</h2>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <button
                class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                :class="isDarkMode ? 'bg-blue-600' : 'bg-gray-300'"
                @click="themeStore.toggleTheme()"
              >
                <span
                  class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                  :class="isDarkMode ? 'translate-x-7' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </BaseCard>

        <!-- Currency Section -->
        <BaseCard>
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-dollar-sign text-2xl text-green-600 dark:text-green-400" />
            <h2 class="text-xl font-semibold">Currency</h2>
          </div>
          <div class="space-y-4">
            <div>
              <label
                for="currency-select"
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Default Currency
              </label>
              <select
                id="currency-select"
                v-model="selectedCurrency"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                @change="handleCurrencyChange"
              >
                <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                  {{ currency.symbol }} - {{ currency.name }} ({{ currency.code }})
                </option>
              </select>
            </div>
          </div>
        </BaseCard>

        <!-- Gemini API Section -->
        <BaseCard>
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-sparkles text-2xl text-purple-600 dark:text-purple-400" />
            <h2 class="text-xl font-semibold">Gemini API</h2>
          </div>
          <div class="space-y-4">
            <div>
              <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Configure your Gemini API token for OCR bill scanning (future feature)
              </p>
              <div class="flex items-center gap-2">
                <BaseButton variant="secondary" @click="showTokenModal = true">
                  <div class="i-lucide-key text-lg" />
                  {{ settingsStore.hasGeminiToken ? 'Update Token' : 'Add Token' }}
                </BaseButton>
                <div
                  v-if="settingsStore.hasGeminiToken"
                  class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"
                >
                  <div class="i-lucide-check-circle text-base" />
                  <span>Token configured</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Data Management Section -->
        <BaseCard>
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-database text-2xl text-orange-600 dark:text-orange-400" />
            <h2 class="text-xl font-semibold">Data Management</h2>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Export Data</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Download all your squads and bills as JSON
                </p>
              </div>
              <BaseButton variant="secondary" @click="handleExport">
                <div class="i-lucide-download text-lg" />
                Export
              </BaseButton>
            </div>
            <div class="border-t border-gray-200 pt-3 dark:border-gray-700" />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Import Data</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Load squads and bills from a JSON file
                </p>
              </div>
              <BaseButton variant="secondary" @click="handleImport">
                <div class="i-lucide-upload text-lg" />
                Import
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- Advanced Section -->
        <BaseCard>
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-shield-alert text-2xl text-red-600 dark:text-red-400" />
            <h2 class="text-xl font-semibold">Advanced</h2>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Reset Settings</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Restore all settings to default values
                </p>
              </div>
              <BaseButton variant="danger" @click="showResetConfirm = true">
                <div class="i-lucide-rotate-ccw text-lg" />
                Reset
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- App Info -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Squad Bill v1.0.0</p>
          <p class="mt-1">Made with ❤️ for easier bill splitting</p>
        </div>
      </div>
    </main>

    <!-- Gemini Token Modal -->
    <BaseModal v-model="showTokenModal" title="Gemini API Token" icon="i-lucide-key">
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Enter your Gemini API token to enable OCR bill scanning features. You can get a token from
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline dark:text-blue-400"
          >
            Google AI Studio
          </a>
          .
        </p>
        <div class="relative">
          <BaseInput
            v-model="geminiToken"
            label="API Token"
            :type="showToken ? 'text' : 'password'"
            placeholder="Enter your Gemini API token"
          />
          <button
            class="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="showToken = !showToken"
          >
            <div :class="showToken ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="text-lg" />
          </button>
        </div>
        <div class="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div class="flex gap-2">
            <div class="i-lucide-info mt-0.5 text-yellow-600 dark:text-yellow-400" />
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              Your token is stored locally on your device and never sent to any server except Google
              AI services.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showTokenModal = false">Cancel</BaseButton>
          <BaseButton @click="handleSaveToken">Save Token</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Reset Confirmation -->
    <ConfirmDialog
      v-model="showResetConfirm"
      title="Reset Settings"
      message="Are you sure you want to reset all settings to default values? This will not delete your squads or bills."
      confirm-text="Reset"
      confirm-variant="danger"
      @confirm="handleResetSettings"
    />

    <!-- Import Input -->
    <input
      ref="importInput"
      type="file"
      accept="application/json"
      class="hidden"
      @change="handleImportFile"
    />
  </div>
</template>
