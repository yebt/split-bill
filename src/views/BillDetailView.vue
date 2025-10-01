<template>
  <div v-if="bill && parche" class="min-h-screen">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto max-w-7xl px-4 py-4">
        <div class="mb-3 flex items-center gap-3">
          <button
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            @click="router.back()"
          >
            <div class="i-lucide-arrow-left text-2xl" />
          </button>
          <div class="flex-1">
            <h1 class="text-2xl font-bold">Bill Details</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(bill.createdAt) }}</p>
          </div>
          <BaseButton variant="danger" size="sm" @click="showDeleteConfirm = true">
            <div class="i-lucide-trash text-lg" />
          </BaseButton>
        </div>

        <!-- Bill Type Badge -->
        <div class="flex items-center gap-2">
          <span
            :class="[
              'rounded px-3 py-1 text-sm font-medium',
              bill.type === 'equal'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            ]"
          >
            {{ bill.type === 'equal' ? 'Equal Split' : 'Distributed' }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-3xl px-4 py-6">
      <div class="space-y-6">
        <!-- Products -->
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Products</h3>
          <div class="space-y-3">
            <div
              v-for="product in bill.products"
              :key="product.id"
              class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
            >
              <div class="mb-2 flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ product.quantity }} × ${{ product.price.toFixed(2) }} = ${{
                      (product.quantity * product.price).toFixed(2)
                    }}
                  </div>
                </div>
              </div>

              <!-- Assigned People -->
              <div v-if="bill.type === 'distributed' && product.assignedTo.length > 0" class="mt-2">
                <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">Assigned to:</div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="personId in product.assignedTo"
                    :key="personId"
                    class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {{ getPersonName(personId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div class="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span class="text-blue-600 dark:text-blue-400"
                >${billStore.currentBillTotal.toFixed(2)}</span
              >
            </div>
          </div>
        </BaseCard>

        <!-- Exonerated People -->
        <BaseCard v-if="bill.exoneratedPeople.length > 0">
          <h3 class="mb-3 text-lg font-semibold">Exonerated People</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="personId in bill.exoneratedPeople"
              :key="personId"
              class="rounded-lg bg-red-100 px-3 py-1 text-red-700 dark:bg-red-900 dark:text-red-300"
            >
              {{ getPersonName(personId) }}
            </span>
          </div>
        </BaseCard>

        <!-- Split Details -->
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Split Details</h3>
          <div class="space-y-2">
            <div
              v-for="[personId, amount] of billStore.currentBillSplit"
              :key="personId"
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
            >
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'h-2 w-2 rounded-full',
                    getPersonActive(personId) ? 'bg-green-500' : 'bg-gray-400',
                  ]"
                />
                <span class="font-medium">{{ getPersonName(personId) }}</span>
              </div>
              <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
                ${{ amount.toFixed(2) }}
              </span>
            </div>
          </div>
        </BaseCard>

        <!-- Share Actions -->
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Share</h3>
          <div class="flex gap-2">
            <BaseButton variant="secondary" full-width @click="shareAsText">
              <div class="i-lucide-share-2 text-lg" />
              Share as Text
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </main>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Bill"
      message="Are you sure you want to delete this bill? This action cannot be undone."
      confirm-text="Delete"
      confirm-variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useParcheStore } from '@/stores/parcheStore'
import { useBillStore } from '@/stores/billStore'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const parcheStore = useParcheStore()
const billStore = useBillStore()

const showDeleteConfirm = ref(false)

const parche = computed(() => parcheStore.currentParche)
const bill = computed(() => billStore.currentBill)

onMounted(() => {
  const parcheId = route.params.parcheId as string
  const billId = route.params.billId as string
  parcheStore.setCurrentParche(parcheId)
  billStore.setCurrentBill(billId)
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPersonName(personId: string): string {
  const person = parcheStore.currentParcheAllPeople.find((p) => p.id === personId)
  return person?.name || 'Unknown'
}

function getPersonActive(personId: string): boolean {
  const person = parcheStore.currentParcheAllPeople.find((p) => p.id === personId)
  return person?.active || false
}

function shareAsText() {
  if (!bill.value || !parche.value) return

  let text = `🧾 Bill from ${parche.value.name}\n`
  text += `📅 ${formatDate(bill.value.createdAt)}\n\n`

  text += `📦 Products:\n`
  bill.value.products.forEach((product) => {
    text += `  • ${product.name}: ${product.quantity} × $${product.price.toFixed(2)} = $${(product.quantity * product.price).toFixed(2)}\n`
  })

  text += `\n💰 Total: $${billStore.currentBillTotal.toFixed(2)}\n\n`

  text += `👥 Split:\n`
  billStore.currentBillSplit.forEach((amount, personId) => {
    text += `  • ${getPersonName(personId)}: $${amount.toFixed(2)}\n`
  })

  if (navigator.share) {
    navigator.share({ text })
  } else {
    navigator.clipboard.writeText(text)
    alert('Bill details copied to clipboard!')
  }
}

function handleDelete() {
  if (!bill.value || !parche.value) return
  billStore.deleteBill(bill.value.id)
  router.push({ name: 'parche-detail', params: { id: parche.value.id } })
}
</script>
