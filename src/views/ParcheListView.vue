<script setup lang="ts">
import { computed, ref } from 'vue'
import { useParcheStore } from '@/stores/parcheStore'
import { useThemeStore } from '@/stores/themeStore'
import type { Parche } from '@/types/domain'
import { capitalizeWords } from '@/utils/text'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const parcheStore = useParcheStore()
const parchesList = computed<Parche[]>(() => parcheStore.parches)

const themeStore = useThemeStore()

const showCreateModal = ref(false)
const newParcheName = ref('')
const createError = ref('')

const showOptionsModal = ref(false)
const selectedParcheId = ref<string | null>(null)

const showDuplicateModal = ref(false)
const duplicateName = ref('')
const duplicateError = ref('')

const showDeleteConfirm = ref(false)

const importInput = ref<HTMLInputElement>()

function getParcheStats(parche: Parche) {
  const allPeople = parche.groups.flatMap((g) => g.people)
  return {
    totalPeople: allPeople.length,
    activePeople: allPeople.filter((p) => p.active).length,
  }
}

// function goToParche(id: string) {
//   router.push({ name: 'parche-detail', params: { id } })
// }

function handleCreate() {
  createError.value = ''

  // Validate parche name
  const trimmedName = newParcheName.value.trim()
  if (!trimmedName) {
    createError.value = 'Parche name is required'
    return
  }

  // Capitalize parche name
  const capitalizedName = capitalizeWords(trimmedName)

  try {
    parcheStore.createParche(capitalizedName)
    showCreateModal.value = false
    newParcheName.value = ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Failed to create parche'
  }
}

function openOptionsMenu(id: string) {
  selectedParcheId.value = id
  showOptionsModal.value = true
}

function handleDuplicate() {
  showOptionsModal.value = false
  const parche = parcheStore.parches.find((p) => p.id === selectedParcheId.value)
  if (parche) {
    duplicateName.value = `${parche.name} (Copy)`
    showDuplicateModal.value = true
  }
}

function handleDuplicateSubmit() {
  if (!selectedParcheId.value) return
  duplicateError.value = ''

  // Validate parche name
  const trimmedName = duplicateName.value.trim()
  if (!trimmedName) {
    duplicateError.value = 'Parche name is required'
    return
  }

  // Capitalize parche name
  const capitalizedName = capitalizeWords(trimmedName)

  try {
    parcheStore.duplicateParche(selectedParcheId.value, capitalizedName)
    showDuplicateModal.value = false
    duplicateName.value = ''
  } catch (error) {
    duplicateError.value = error instanceof Error ? error.message : 'Failed to duplicate parche'
  }
}

function confirmDelete() {
  showOptionsModal.value = false
  showDeleteConfirm.value = true
}

function handleDelete() {
  if (selectedParcheId.value) {
    parcheStore.deleteParche(selectedParcheId.value)
    selectedParcheId.value = null
  }
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
</script>

<template>
  <div class="min-h-dvh">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <!-- <div class="i-lucide-receipt text-3xl text-blue-600 dark:text-blue-400" /> -->
          <div>
            <img src="@/assets/logo.svg" alt="Logo" class="h-10 w-10" />
          </div>
          <h1 class="text-2xl font-bold">Split Bill</h1>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="handleImport">
            <div class="i-lucide-upload text-lg" />
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="handleExport">
            <div class="i-lucide-download text-lg" />
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="themeStore.toggleTheme()">
            <div
              :class="themeStore.theme === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              class="text-lg"
            />
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-6">
      <!-- Empty State -->
      <div v-if="parcheStore.parches.length === 0" class="py-16 text-center">
        <div class="i-lucide-users mx-auto mb-4 text-6xl text-gray-300 dark:text-gray-600" />
        <h2 class="mb-2 text-2xl font-semibold text-gray-700 dark:text-gray-300">No parches yet</h2>
        <p class="mb-6 text-gray-500 dark:text-gray-400">
          Create your first parche to start splitting bills
        </p>
        <BaseButton @click="showCreateModal = true">
          <div class="i-lucide-plus text-lg" />
          Create Parche
        </BaseButton>
      </div>

      <!-- Parche List -->
      <div v-else>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Your Parches</h2>
          <BaseButton @click="showCreateModal = true">
            <div class="i-lucide-plus text-lg" />
            New Parche
          </BaseButton>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BaseCard v-for="parche in parchesList" :key="parche.id" clickable>
            <RouterLink :to="{ name: 'parche-detail', params: { id: parche.id } }">
              <div class="mb-3 flex items-start justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ parche.name }}
                </h3>
                <button
                  class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                  @click.stop="openOptionsMenu(parche.id)"
                >
                  <div class="i-lucide-more-vertical text-xl" />
                </button>
              </div>

              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center gap-2">
                  <div class="i-lucide-users text-base" />
                  <span
                    >{{ getParcheStats(parche).totalPeople }} people ({{
                      getParcheStats(parche).activePeople
                    }}
                    active)</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <div class="i-lucide-layers text-base" />
                  <span>{{ parche.groups.length }} groups</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="i-lucide-receipt text-base" />
                  <span>{{ parche.bills.length }} bills</span>
                </div>
              </div>
            </RouterLink>
          </BaseCard>
        </div>
      </div>
    </main>

    <!-- Create Parche Modal -->
    <BaseModal v-model="showCreateModal" title="Create New Parche">
      <form @submit.prevent="handleCreate">
        <BaseInput
          v-model="newParcheName"
          label="Parche Name"
          placeholder="e.g., Weekend Trip, Dinner Party"
          required
          autofocus
          :error="createError"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreate">Create</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Options Menu Modal -->
    <BaseModal v-model="showOptionsModal" title="Parche Options">
      <div class="space-y-2">
        <BaseButton variant="ghost" full-width @click="handleDuplicate">
          <div class="i-lucide-copy text-lg" />
          Duplicate
        </BaseButton>
        <BaseButton variant="danger" full-width @click="confirmDelete">
          <div class="i-lucide-trash text-lg" />
          Delete
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Duplicate Modal -->
    <BaseModal v-model="showDuplicateModal" title="Duplicate Parche">
      <form @submit.prevent="handleDuplicateSubmit">
        <BaseInput
          v-model="duplicateName"
          label="New Parche Name"
          placeholder="Enter name for duplicated parche"
          required
          autofocus
          :error="duplicateError"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showDuplicateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleDuplicateSubmit">Duplicate</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Parche"
      message="Are you sure you want to delete this parche? This action cannot be undone."
      confirm-text="Delete"
      confirm-variant="danger"
      @confirm="handleDelete"
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
