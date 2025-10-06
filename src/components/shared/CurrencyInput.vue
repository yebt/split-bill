<script setup lang="ts">
import { computed } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'
import { type CurrencyInputOptions, CurrencyDisplay } from 'vue-currency-input'

interface Props {
  modelValue: number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  autofocus?: boolean
  options?: Partial<CurrencyInputOptions>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  required: false,
  disabled: false,
  autofocus: false,
})

defineEmits<{
  'update:modelValue': [value: number]
  blur: []
}>()

const currencyOptions: CurrencyInputOptions = {
  currency: 'USD',
  currencyDisplay: CurrencyDisplay.narrowSymbol,
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: true,
  precision: 2,
  ...props.options,
}

const { inputRef } = useCurrencyInput(currencyOptions)

const inputClasses = computed(() => {
  const base =
    'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2'
  const state = props.error
    ? 'border-red-500 dark:border-red-400'
    : 'border-gray-300 dark:border-gray-600'
  const bg = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

  return `${base} ${state} ${bg}`
})
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        ref="inputRef"
        type="text"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="inputClasses"
        @blur="$emit('blur')"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>
