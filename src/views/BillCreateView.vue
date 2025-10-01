<template>
  <div v-if="parche" class="min-h-screen">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center gap-3">
          <button
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            @click="router.back()"
          >
            <div class="i-lucide-arrow-left text-2xl" />
          </button>
          <h1 class="text-2xl font-bold flex-1">New Bill</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      <div class="space-y-6">
        <!-- Bill Type Selection -->
        <BaseCard>
          <h3 class="text-lg font-semibold mb-4">Bill Type</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="[
                'p-4 rounded-lg border-2 transition-all text-left',
                billType === 'equal'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
              ]"
              @click="billType = 'equal'"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="i-lucide-equal text-xl" />
                <span class="font-semibold">Equal Split</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Divide total evenly among active people
              </p>
            </button>

            <button
              :class="[
                'p-4 rounded-lg border-2 transition-all text-left',
                billType === 'distributed'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
              ]"
              @click="billType = 'distributed'"
            >
              <div class="flex items-center gap-2 mb-2">
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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Products</h3>
            <BaseButton size="sm" @click="showAddProductModal = true">
              <div class="i-lucide-plus text-lg" />
              Add Product
            </BaseButton>
          </div>

          <div v-if="products.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            No products added yet
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(product, index) in products"
              :key="index"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ product.quantity }} × ${{ product.price.toFixed(2) }} = ${{ (product.quantity * product.price).toFixed(2) }}
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
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned to:</div>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="person in parcheStore.currentParcheActivePeople"
                    :key="person.id"
                    :class="[
                      'px-2 py-1 text-xs rounded transition-colors',
                      product.assignedTo.includes(person.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
                    ]"
                    @click="toggleAssignment(index, person.id)"
                  >
                    {{ person.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Exonerated People -->
        <BaseCard>
          <h3 class="text-lg font-semibold mb-4">Exonerated People</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select people who won't pay for this bill
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="person in parcheStore.currentParcheActivePeople"
              :key="person.id"
              :class="[
                'px-3 py-2 rounded-lg transition-colors',
                exoneratedPeople.includes(person.id)
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
              ]"
              @click="toggleExoneration(person.id)"
            >
              {{ person.name }}
            </button>
          </div>
        </BaseCard>

        <!-- Preview -->
        <BaseCard v-if="products.length > 0">
          <h3 class="text-lg font-semibold mb-4">Split Preview</h3>
          <div class="space-y-2">
            <div
              v-for="person in participatingPeople"
              :key="person.id"
              class="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700"
            >
              <span>{{ person.name }}</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">
                ${{ calculatePersonAmount(person.id).toFixed(2) }}
              </span>
            </div>
          </div>
        </BaseCard>

        <!-- Actions -->
        <div class="flex gap-3">
          <BaseButton variant="ghost" full-width @click="router.back()">
            Cancel
          </BaseButton>
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
    <BaseModal v-model="showAddProductModal" :title="editingProductIndex !== null ? 'Edit Product' : 'Add Product'">
      <form @submit.prevent="handleAddProduct">
        <div class="space-y-4">
          <BaseInput
            v-model="productForm.name"
            label="Product Name"
            placeholder="e.g., Pizza, Beer"
            required
          />
          <BaseInput
            v-model="productForm.quantity"
            type="number"
            label="Quantity"
            :min="1"
            :step="1"
            required
          />
          <BaseInput
            v-model="productForm.price"
            type="number"
            label="Price"
            :min="0"
            :step="0.01"
            required
          />
        </div>
        <template #footer>
          <div class="flex gap-2 justify-end">
            <BaseButton variant="ghost" @click="closeProductModal">Cancel</BaseButton>
            <BaseButton type="submit">{{ editingProductIndex !== null ? 'Save' : 'Add' }}</BaseButton>
          </div>
        </template>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useParcheStore } from '@/stores/parcheStore'
import { useBillStore } from '@/stores/billStore'
import type { BillType, Person } from '@/types/domain'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const parcheStore = useParcheStore()
const billStore = useBillStore()

const billType = ref<BillType>('equal')
const products = ref<Array<{ name: string; quantity: number; price: number; assignedTo: string[] }>>([])
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
  return parcheStore.currentParcheActivePeople.filter(
    (p) => !exoneratedPeople.value.includes(p.id)
  )
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
    product.name = productForm.value.name
    product.quantity = productForm.value.quantity
    product.price = productForm.value.price
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
        product.price
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
