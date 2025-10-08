<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useParcheStore } from '@/stores/parcheStore'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const parcheStore = useParcheStore()

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

// Computed
const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
    // Handle body scroll
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})

function close() {
  isOpen.value = false
}

function handleCurrencyChange() {
  settingsStore.setCurrency(selectedCurrency.value)
}

function handleSaveToken() {
  settingsStore.setGeminiApiToken(geminiToken.value)
  showTokenModal.value = false
}

function handleExport() {
  const data = parcheStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `split-bill-export-${new Date().toISOString().split('T')[0]}.json`
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
      parcheStore.importData(data)
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
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="close"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-gray-50 shadow-2xl dark:bg-gray-900 sm:w-96"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="i-lucide-settings text-2xl text-blue-600 dark:text-blue-400" />
            <h2 class="text-xl font-bold">Configuración</h2>
          </div>
          <button
            class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            @click="close"
          >
            <div class="i-lucide-x text-2xl" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6 p-6">
        <!-- Appearance Section -->
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-palette text-xl text-blue-600 dark:text-blue-400" />
            <h3 class="font-semibold">Apariencia</h3>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Modo Oscuro</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Alternar tema claro/oscuro</p>
            </div>
            <button
              class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
              :class="themeStore.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'"
              @click="themeStore.toggleTheme()"
            >
              <span
                class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                :class="themeStore.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Currency Section -->
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-dollar-sign text-xl text-green-600 dark:text-green-400" />
            <h3 class="font-semibold">Moneda</h3>
          </div>
          <div>
            <label
              for="currency-select"
              class="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Moneda Predeterminada
            </label>
            <select
              id="currency-select"
              v-model="selectedCurrency"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              @change="handleCurrencyChange"
            >
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.symbol }} - {{ currency.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Gemini API Section -->
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-sparkles text-xl text-purple-600 dark:text-purple-400" />
            <h3 class="font-semibold">Gemini API</h3>
          </div>
          <div>
            <p class="mb-3 text-xs text-gray-600 dark:text-gray-400">
              Token para escaneo OCR de facturas (función futura)
            </p>
            <div class="flex items-center gap-2">
              <BaseButton variant="secondary" size="sm" @click="showTokenModal = true">
                <div class="i-lucide-key text-base" />
                {{ settingsStore.hasGeminiToken ? 'Actualizar' : 'Agregar' }}
              </BaseButton>
              <div
                v-if="settingsStore.hasGeminiToken"
                class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
              >
                <div class="i-lucide-check-circle text-sm" />
                <span>Configurado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management Section -->
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-database text-xl text-orange-600 dark:text-orange-400" />
            <h3 class="font-semibold">Datos</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Exportar</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Descargar como JSON</p>
              </div>
              <BaseButton variant="secondary" size="sm" @click="handleExport">
                <div class="i-lucide-download text-base" />
              </BaseButton>
            </div>
            <div class="border-t border-gray-200 pt-3 dark:border-gray-700" />
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Importar</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cargar desde JSON</p>
              </div>
              <BaseButton variant="secondary" size="sm" @click="handleImport">
                <div class="i-lucide-upload text-base" />
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Advanced Section -->
        <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-2">
            <div class="i-lucide-shield-alert text-xl text-red-600 dark:text-red-400" />
            <h3 class="font-semibold">Avanzado</h3>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                Restablecer Configuración
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Valores predeterminados</p>
            </div>
            <BaseButton variant="danger" size="sm" @click="showResetConfirm = true">
              <div class="i-lucide-rotate-ccw text-base" />
            </BaseButton>
          </div>
        </div>

        <!-- App Info -->
        <div class="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Split Bill v1.0.0</p>
          <p class="mt-1">Hecho con ❤️ para dividir cuentas fácilmente</p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Gemini Token Modal -->
  <BaseModal v-model="showTokenModal" title="Token Gemini API" icon="i-lucide-key">
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Ingresa tu token de Gemini API para habilitar el escaneo OCR de facturas. Puedes obtener
        un token desde
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
          label="Token API"
          :type="showToken ? 'text' : 'password'"
          placeholder="Ingresa tu token de Gemini API"
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
            Tu token se almacena localmente en tu dispositivo y nunca se envía a ningún servidor
            excepto los servicios de Google AI.
          </p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="ghost" @click="showTokenModal = false">Cancelar</BaseButton>
        <BaseButton @click="handleSaveToken">Guardar Token</BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Reset Confirmation -->
  <ConfirmDialog
    v-model="showResetConfirm"
    title="Restablecer Configuración"
    message="¿Estás seguro de que deseas restablecer toda la configuración a los valores predeterminados? Esto no eliminará tus parches ni facturas."
    confirm-text="Restablecer"
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
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
