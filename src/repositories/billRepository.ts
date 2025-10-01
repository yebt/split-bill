import { ulid } from 'ulid'
import type { Bill, Product, BillType } from '@/types/domain'
import { parcheRepository } from './parcheRepository'

export class BillRepository {
  createBill(parcheId: string, type: BillType): Bill {
    const parche = parcheRepository.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    const newBill: Bill = {
      id: ulid(),
      parcheId,
      type,
      products: [],
      exoneratedPeople: [],
      createdAt: new Date().toISOString(),
    }

    parche.bills.push(newBill)
    parcheRepository.update(parcheId, { bills: parche.bills })
    return newBill
  }

  findById(billId: string): Bill | null {
    const parches = parcheRepository.findAll()
    for (const parche of parches) {
      const bill = parche.bills.find((b) => b.id === billId)
      if (bill) {
        return bill
      }
    }
    return null
  }

  findByParcheId(parcheId: string): Bill[] {
    const parche = parcheRepository.findById(parcheId)
    return parche?.bills || []
  }

  updateBill(billId: string, updates: Partial<Omit<Bill, 'id' | 'parcheId' | 'createdAt'>>): Bill {
    const parches = parcheRepository.findAll()

    for (const parche of parches) {
      const billIndex = parche.bills.findIndex((b) => b.id === billId)
      if (billIndex !== -1) {
        const currentBill = parche.bills[billIndex]
        const updated = { ...currentBill, ...updates } as Bill
        parche.bills[billIndex] = updated
        parcheRepository.update(parche.id, { bills: parche.bills })
        return updated
      }
    }

    throw new Error(`Bill with id "${billId}" not found`)
  }

  deleteBill(billId: string): void {
    const parches = parcheRepository.findAll()

    for (const parche of parches) {
      const filtered = parche.bills.filter((b) => b.id !== billId)
      if (filtered.length !== parche.bills.length) {
        parcheRepository.update(parche.id, { bills: filtered })
        return
      }
    }

    throw new Error(`Bill with id "${billId}" not found`)
  }

  // Product operations
  addProduct(billId: string, name: string, quantity: number, price: number): Product {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    const newProduct: Product = {
      id: ulid(),
      name,
      quantity,
      price,
      assignedTo: [],
    }

    bill.products.push(newProduct)
    this.updateBill(billId, { products: bill.products })
    return newProduct
  }

  updateProduct(billId: string, productId: string, updates: Partial<Omit<Product, 'id'>>): Product {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    const productIndex = bill.products.findIndex((p) => p.id === productId)
    if (productIndex === -1) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    const currentProduct = bill.products[productIndex]
    const updated = { ...currentProduct, ...updates } as Product
    bill.products[productIndex] = updated
    this.updateBill(billId, { products: bill.products })
    return updated
  }

  deleteProduct(billId: string, productId: string): void {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    const filtered = bill.products.filter((p) => p.id !== productId)
    if (filtered.length === bill.products.length) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    this.updateBill(billId, { products: filtered })
  }

  assignProductToPerson(billId: string, productId: string, personId: string): void {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    const product = bill.products.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    if (!product.assignedTo.includes(personId)) {
      product.assignedTo.push(personId)
      this.updateBill(billId, { products: bill.products })
    }
  }

  unassignProductFromPerson(billId: string, productId: string, personId: string): void {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    const product = bill.products.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    product.assignedTo = product.assignedTo.filter((id) => id !== personId)
    this.updateBill(billId, { products: bill.products })
  }

  // Exoneration operations
  exoneratePerson(billId: string, personId: string): void {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    if (!bill.exoneratedPeople.includes(personId)) {
      bill.exoneratedPeople.push(personId)
      this.updateBill(billId, { exoneratedPeople: bill.exoneratedPeople })
    }
  }

  unexoneratePerson(billId: string, personId: string): void {
    const bill = this.findById(billId)
    if (!bill) {
      throw new Error(`Bill with id "${billId}" not found`)
    }

    bill.exoneratedPeople = bill.exoneratedPeople.filter((id) => id !== personId)
    this.updateBill(billId, { exoneratedPeople: bill.exoneratedPeople })
  }

  // Calculation methods
  calculateBillTotal(billId: string): number {
    const bill = this.findById(billId)
    if (!bill) {
      return 0
    }

    return bill.products.reduce((sum, product) => {
      return sum + product.quantity * product.price
    }, 0)
  }

  calculateBillSplit(billId: string): Map<string, number> {
    const bill = this.findById(billId)
    if (!bill) {
      return new Map()
    }

    const parche = parcheRepository.findById(bill.parcheId)
    if (!parche) {
      return new Map()
    }

    const activePeople = parcheRepository.getActivePeople(bill.parcheId)
    const participatingPeople = activePeople.filter((p) => !bill.exoneratedPeople.includes(p.id))

    const debts = new Map<string, number>()
    participatingPeople.forEach((p) => debts.set(p.id, 0))

    if (bill.type === 'equal') {
      // Equal split: divide total evenly
      const total = this.calculateBillTotal(billId)
      const perPerson = total / participatingPeople.length

      participatingPeople.forEach((p) => {
        debts.set(p.id, perPerson)
      })
    } else {
      // Distributed split
      let assignedTotal = 0

      // Calculate assigned products
      for (const product of bill.products) {
        const productTotal = product.quantity * product.price
        if (product.assignedTo.length > 0) {
          const perPerson = productTotal / product.assignedTo.length
          product.assignedTo.forEach((personId) => {
            if (debts.has(personId)) {
              debts.set(personId, (debts.get(personId) || 0) + perPerson)
            }
          })
          assignedTotal += productTotal
        }
      }

      // Calculate unassigned remainder
      const total = this.calculateBillTotal(billId)
      const remainder = total - assignedTotal

      if (remainder > 0 && participatingPeople.length > 0) {
        const perPerson = remainder / participatingPeople.length
        participatingPeople.forEach((p) => {
          debts.set(p.id, (debts.get(p.id) || 0) + perPerson)
        })
      }
    }

    return debts
  }

  calculateParcheTotals(parcheId: string): Map<string, number> {
    const bills = this.findByParcheId(parcheId)
    const totals = new Map<string, number>()

    for (const bill of bills) {
      const billDebts = this.calculateBillSplit(bill.id)
      billDebts.forEach((amount, personId) => {
        totals.set(personId, (totals.get(personId) || 0) + amount)
      })
    }

    return totals
  }
}

export const billRepository = new BillRepository()
