import { ulid } from 'ulid'
import type { Bill, Product, BillType } from '@/types/domain'
import { squadRepository } from './squadRepository'

export class BillRepository {
  createBill(squadId: string, type: BillType): Bill {
    const squad = squadRepository.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    const newBill: Bill = {
      id: ulid(),
      squadId,
      type,
      products: [],
      exoneratedPeople: [],
      createdAt: new Date().toISOString(),
    }

    squad.bills.push(newBill)
    squadRepository.update(squadId, { bills: squad.bills })
    return newBill
  }

  findById(billId: string): Bill | null {
    const squads = squadRepository.findAll()
    for (const squad of squads) {
      const bill = squad.bills.find((b) => b.id === billId)
      if (bill) {
        return bill
      }
    }
    return null
  }

  findBySquadId(squadId: string): Bill[] {
    const squad = squadRepository.findById(squadId)
    return squad?.bills || []
  }

  updateBill(billId: string, updates: Partial<Omit<Bill, 'id' | 'squadId' | 'createdAt'>>): Bill {
    const squads = squadRepository.findAll()

    for (const squad of squads) {
      const billIndex = squad.bills.findIndex((b) => b.id === billId)
      if (billIndex !== -1) {
        const currentBill = squad.bills[billIndex]
        const updated = { ...currentBill, ...updates } as Bill
        squad.bills[billIndex] = updated
        squadRepository.update(squad.id, { bills: squad.bills })
        return updated
      }
    }

    throw new Error(`Bill with id "${billId}" not found`)
  }

  deleteBill(billId: string): void {
    const squads = squadRepository.findAll()

    for (const squad of squads) {
      const filtered = squad.bills.filter((b) => b.id !== billId)
      if (filtered.length !== squad.bills.length) {
        squadRepository.update(squad.id, { bills: filtered })
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

    const squad = squadRepository.findById(bill.squadId)
    if (!squad) {
      return new Map()
    }

    const activePeople = squadRepository.getActivePeople(bill.squadId)
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

  calculateSquadTotals(squadId: string): Map<string, number> {
    const bills = this.findBySquadId(squadId)
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
