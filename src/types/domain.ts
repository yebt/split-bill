/**
 * Domain models for the split-bill application
 */

export interface Person {
  id: string
  name: string // unique per parche
  active: boolean
}

export interface Group {
  id: string
  name: string // unique per parche
  color: string
  people: Person[]
}

export interface Product {
  id: string
  name: string
  quantity: number
  price: number
  assignedTo: string[] // person IDs
}

export type BillType = 'equal' | 'distributed'

export interface Bill {
  id: string
  parcheId: string
  type: BillType
  products: Product[]
  exoneratedPeople: string[] // person IDs
  createdAt: string // ISO date string
}

export interface Parche {
  id: string
  name: string // unique globally
  groups: Group[]
  bills: Bill[]
}

/**
 * Utility types for calculations
 */
export interface PersonDebt {
  personId: string
  personName: string
  amount: number
}

export interface BillSummary {
  billId: string
  total: number
  debts: PersonDebt[]
  createdAt: string
}

export interface ParcheSummary {
  parcheId: string
  totalSpent: number
  billCount: number
  personDebts: Map<string, number> // personId -> total debt
}

/**
 * Color palette for groups
 */
export const GROUP_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
] as const

/**
 * Generate a random color with high contrast
 */
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 15) // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Get a random unused color from the palette, or generate a new one if all are used
 */
export function getRandomUnusedColor(usedColors: string[]): string {
  const availableColors = GROUP_COLORS.filter(color => !usedColors.includes(color))
  
  if (availableColors.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableColors.length)
    return availableColors[randomIndex] as string
  }
  
  // All predefined colors are used, generate a random one
  let newColor: string
  do {
    newColor = generateRandomColor()
  } while (usedColors.includes(newColor))
  
  return newColor
}
