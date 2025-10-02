/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
export function capitalizeWords(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
