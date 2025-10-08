import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Formats a number as currency, hiding decimals when they are zero
 * @param amount - The amount to format
 * @param currency - The currency code (optional, uses settings store if not provided)
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currency?: string): string {
  // Get currency from settings store if not provided
  const settingsStore = useSettingsStore()
  const currencyCode = currency || settingsStore.currency

  // Check if the amount has non-zero decimal places
  const hasDecimals = amount % 1 !== 0

  // Format with appropriate decimal places
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })

  return formatter.format(amount)
}

/**
 * Formats a number as currency without the currency symbol
 * @param amount - The amount to format
 * @returns The formatted amount string
 */
export function formatAmount(amount: number): string {
  const hasDecimals = amount % 1 !== 0

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })

  return formatter.format(amount)
}
