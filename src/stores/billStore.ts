import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bill, Product, BillType } from '@/types/domain'
import { billRepository } from '@/repositories/billRepository'
import { useParcheStore } from './parcheStore'

export const useBillStore = defineStore('bill', () => {
  // State
  const currentBillId = ref<string | null>(null)

  // Computed
  const currentBill = computed(() => {
    if (!currentBillId.value) return null
    return billRepository.findById(currentBillId.value)
  })

  const currentBillTotal = computed(() => {
    if (!currentBillId.value) return 0
    return billRepository.calculateBillTotal(currentBillId.value)
  })

  const currentBillSplit = computed(() => {
    if (!currentBillId.value) return new Map()
    return billRepository.calculateBillSplit(currentBillId.value)
  })

  const currentParcheBills = computed(() => {
    const parcheStore = useParcheStore()
    if (!parcheStore.currentParcheId) return []
    return billRepository.findByParcheId(parcheStore.currentParcheId)
  })

  const currentParcheTotals = computed(() => {
    const parcheStore = useParcheStore()
    if (!parcheStore.currentParcheId) return new Map()
    return billRepository.calculateParcheTotals(parcheStore.currentParcheId)
  })

  // Actions
  function setCurrentBill(id: string | null) {
    currentBillId.value = id
  }

  function createBill(parcheId: string, type: BillType): Bill {
    const bill = billRepository.createBill(parcheId, type)
    // Reload parche to update bills
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
    return bill
  }

  function updateBill(
    billId: string,
    updates: Partial<Omit<Bill, 'id' | 'parcheId' | 'createdAt'>>,
  ) {
    billRepository.updateBill(billId, updates)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function deleteBill(billId: string) {
    billRepository.deleteBill(billId)
    if (currentBillId.value === billId) {
      currentBillId.value = null
    }
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  // Product actions
  function addProduct(billId: string, name: string, quantity: number, price: number): Product {
    const product = billRepository.addProduct(billId, name, quantity, price)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
    return product
  }

  function updateProduct(billId: string, productId: string, updates: Partial<Omit<Product, 'id'>>) {
    billRepository.updateProduct(billId, productId, updates)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function deleteProduct(billId: string, productId: string) {
    billRepository.deleteProduct(billId, productId)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function assignProductToPerson(billId: string, productId: string, personId: string) {
    billRepository.assignProductToPerson(billId, productId, personId)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function unassignProductFromPerson(billId: string, productId: string, personId: string) {
    billRepository.unassignProductFromPerson(billId, productId, personId)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function toggleProductAssignment(billId: string, productId: string, personId: string) {
    const bill = billRepository.findById(billId)
    if (!bill) return

    const product = bill.products.find((p) => p.id === productId)
    if (!product) return

    if (product.assignedTo.includes(personId)) {
      unassignProductFromPerson(billId, productId, personId)
    } else {
      assignProductToPerson(billId, productId, personId)
    }
  }

  // Exoneration actions
  function exoneratePerson(billId: string, personId: string) {
    billRepository.exoneratePerson(billId, personId)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function unexoneratePerson(billId: string, personId: string) {
    billRepository.unexoneratePerson(billId, personId)
    const parcheStore = useParcheStore()
    parcheStore.loadParches()
  }

  function toggleExoneration(billId: string, personId: string) {
    const bill = billRepository.findById(billId)
    if (!bill) return

    if (bill.exoneratedPeople.includes(personId)) {
      unexoneratePerson(billId, personId)
    } else {
      exoneratePerson(billId, personId)
    }
  }

  // Calculation helpers
  function getBillTotal(billId: string): number {
    return billRepository.calculateBillTotal(billId)
  }

  function getBillSplit(billId: string): Map<string, number> {
    return billRepository.calculateBillSplit(billId)
  }

  function getParcheTotals(parcheId: string): Map<string, number> {
    return billRepository.calculateParcheTotals(parcheId)
  }

  return {
    // State
    currentBillId,
    // Computed
    currentBill,
    currentBillTotal,
    currentBillSplit,
    currentParcheBills,
    currentParcheTotals,
    // Actions
    setCurrentBill,
    createBill,
    updateBill,
    deleteBill,
    addProduct,
    updateProduct,
    deleteProduct,
    assignProductToPerson,
    unassignProductFromPerson,
    toggleProductAssignment,
    exoneratePerson,
    unexoneratePerson,
    toggleExoneration,
    getBillTotal,
    getBillSplit,
    getParcheTotals,
  }
})
