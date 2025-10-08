<template>
  <div v-if="parche" class="min-h-dvh">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto max-w-7xl px-4 py-4">
        <div class="flex items-center gap-3">
          <button
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            @click="router.back()"
          >
            <div class="i-lucide-arrow-left text-2xl" />
          </button>
          <h1 class="flex-1 text-2xl font-bold">New Bill</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-3xl px-4 py-6">
      <div class="space-y-6">
        <!-- Bill Type Selection -->
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Bill Type</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="[
                'rounded-lg border-2 p-4 text-left transition-all',
                billType === 'equal'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600',
              ]"
              @click="billType = 'equal'"
            >
              <div class="mb-2 flex items-center gap-2">
                <div class="i-lucide-equal text-xl" />
                <span class="font-semibold">Equal Split</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Divide total evenly among active people
              </p>
            </button>

            <button
              :class="[
                'rounded-lg border-2 p-4 text-left transition-all',
                billType === 'distributed'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600',
              ]"
              @click="billType = 'distributed'"
            >
              <div class="mb-2 flex items-center gap-2">
                <div class="i-lucide-split text-xl" />
                <span class="font-semibold">Distributed</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Assign products to specific people
              </p>
            </button>
          </div>
        </BaseCard>

        <!-- Products -->
        <BaseCard>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Products</h3>
            <BaseButton size="sm" @click="showAddProductModal = true">
              <div class="i-lucide-plus text-lg" />
              Add Product
            </BaseButton>
          </div>

          <div
            v-if="products.length === 0"
            class="py-8 text-center text-gray-500 dark:text-gray-400"
          >
            No products added yet
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(product, index) in products"
              :key="index"
              class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
            >
              <div class="mb-2 flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ product.quantity }} × {{ formatCurrency(product.price) }} =
                    {{ formatCurrency(product.quantity * product.price) }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    @click="editProduct(index)"
                  >
                    <div class="i-lucide-edit text-lg" />
                  </button>
                  <button
                    class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    @click="removeProduct(index)"
                  >
                    <div class="i-lucide-trash text-lg" />
                  </button>
                </div>
              </div>

              <!-- Assigned People (for distributed) -->
              <div v-if="billType === 'distributed'" class="mt-2">
                <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">Assigned to:</div>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="person in parcheStore.currentParcheActivePeople"
                    :key="person.id"
                    :class="[
                      'rounded px-2 py-1 text-xs transition-colors',
                      product.assignedTo.includes(person.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
                    ]"
                    @click="toggleAssignment(index, person.id)"
                  >
                    {{ person.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div class="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(total) }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Exonerated People -->
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Exonerated People</h3>
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Select people who won't pay for this bill
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="person in parcheStore.currentParcheActivePeople"
              :key="person.id"
              :class="[
                'rounded-lg px-3 py-2 transition-colors',
                exoneratedPeople.includes(person.id)
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
              ]"
              @click="toggleExoneration(person.id)"
            >
              {{ person.name }}
            </button>
          </div>
        </BaseCard>

        <!-- Preview -->
        <BaseCard v-if="products.length > 0">
          <h3 class="mb-4 text-lg font-semibold">Split Preview</h3>
          <div class="space-y-2">
            <div
              v-for="person in participatingPeople"
              :key="person.id"
              class="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700"
            >
              <span>{{ person.name }}</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">
                {{ formatCurrency(calculatePersonAmount(person.id)) }}
              </span>
            </div>
          </div>
        </BaseCard>

        <!-- Actions -->
        <div class="flex gap-3">
          <BaseButton variant="ghost" full-width @click="router.back()"> Cancel </BaseButton>
          <BaseButton
            full-width
            :disabled="products.length === 0 || participatingPeople.length === 0"
            @click="handleCreateBill"
          >
            Create Bill
          </BaseButton>
        </div>
      </div>
    </main>

    <!-- Add/Edit Product Modal -->
    <BaseModal
      v-model="showAddProductModal"
      :title="editingProductIndex !== null ? 'Edit Product' : 'Add Product'"
      :icon="editingProductIndex !== null ? 'i-lucide-pencil' : 'i-lucide-package-plus'"
    >
      <form @submit.prevent="handleAddProduct">
        <div class="space-y-4">
          <BaseInput
            v-model="productForm.name"
            label="Product Name"
            placeholder="e.g., Pizza, Beer"
            required
            autofocus
          />
          <BaseInput
            v-model="productForm.quantity"
            type="number"
            label="Quantity"
            :min="1"
            :step="1"
            required
          />
          <CurrencyInput v-model="productForm.price" label="Price" required />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="closeProductModal">Cancel</BaseButton>
          <BaseButton @click="handleAddProduct">{{
            editingProductIndex !== null ? 'Save' : 'Add'
          }}</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useParcheStore } from '@/stores/parcheStore'
import { useBillStore } from '@/stores/billStore'
import type { BillType } from '@/types/domain'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'
import CurrencyInput from '@/components/shared/CurrencyInput.vue'
import { formatCurrency } from '@/utils/currency'

const router = useRouter()
const route = useRoute()
const parcheStore = useParcheStore()
const billStore = useBillStore()

const billType = ref<BillType>('equal')
const products = ref<
  Array<{ name: string; quantity: number; price: number; assignedTo: string[] }>
>([])
const exoneratedPeople = ref<string[]>([])

const showAddProductModal = ref(false)
const editingProductIndex = ref<number | null>(null)
const productForm = ref({
  name: '',
  quantity: 1,
  price: 0,
})

const parche = computed(() => parcheStore.currentParche)

const total = computed(() => {
  return products.value.reduce((sum, p) => sum + p.quantity * p.price, 0)
})

const participatingPeople = computed(() => {
  return parcheStore.currentParcheActivePeople.filter((p) => !exoneratedPeople.value.includes(p.id))
})

onMounted(() => {
  const id = route.params.id as string
  parcheStore.setCurrentParche(id)
})

function toggleExoneration(personId: string) {
  const index = exoneratedPeople.value.indexOf(personId)
  if (index > -1) {
    exoneratedPeople.value.splice(index, 1)
  } else {
    exoneratedPeople.value.push(personId)
  }
}

function toggleAssignment(productIndex: number, personId: string) {
  const product = products.value[productIndex]
  if (!product) return
  const index = product.assignedTo.indexOf(personId)
  if (index > -1) {
    product.assignedTo.splice(index, 1)
  } else {
    product.assignedTo.push(personId)
  }
}

function editProduct(index: number) {
  editingProductIndex.value = index
  const product = products.value[index]
  if (!product) return
  productForm.value = {
    name: product.name,
    quantity: product.quantity,
    price: product.price,
  }
  showAddProductModal.value = true
}

function removeProduct(index: number) {
  products.value.splice(index, 1)
}

function handleAddProduct() {
  if (editingProductIndex.value !== null) {
    // Edit existing
    const product = products.value[editingProductIndex.value]
    if (product) {
      product.name = productForm.value.name
      product.quantity = productForm.value.quantity
      product.price = productForm.value.price
    }
  } else {
    // Add new
    products.value.push({
      name: productForm.value.name,
      quantity: productForm.value.quantity,
      price: productForm.value.price,
      assignedTo: [],
    })
  }
  closeProductModal()
}

function closeProductModal() {
  showAddProductModal.value = false
  editingProductIndex.value = null
  productForm.value = {
    name: '',
    quantity: 1,
    price: 0,
  }
}

function calculatePersonAmount(personId: string): number {
  if (billType.value === 'equal') {
    return total.value / participatingPeople.value.length
  } else {
    let assignedTotal = 0
    let unassignedTotal = 0

    for (const product of products.value) {
      const productTotal = product.quantity * product.price
      if (product.assignedTo.length > 0) {
        if (product.assignedTo.includes(personId)) {
          assignedTotal += productTotal / product.assignedTo.length
        }
      } else {
        unassignedTotal += productTotal
      }
    }

    const unassignedPerPerson = unassignedTotal / participatingPeople.value.length
    return assignedTotal + unassignedPerPerson
  }
}

function handleCreateBill() {
  if (!parche.value || products.value.length === 0) return

  try {
    const bill = billStore.createBill(parche.value.id, billType.value)

    // Add products
    for (const product of products.value) {
      const addedProduct = billStore.addProduct(
        bill.id,
        product.name,
        product.quantity,
        product.price,
      )

      // Assign people for distributed bills
      if (billType.value === 'distributed') {
        for (const personId of product.assignedTo) {
          billStore.assignProductToPerson(bill.id, addedProduct.id, personId)
        }
      }
    }

    // Set exonerated people
    for (const personId of exoneratedPeople.value) {
      billStore.exoneratePerson(bill.id, personId)
    }

    router.push({ name: 'bill-detail', params: { parcheId: parche.value.id, billId: bill.id } })
  } catch (error) {
    alert('Failed to create bill: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
</script>
