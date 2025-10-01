<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        @input="handleInput"
        @blur="$emit('blur')"
      />
      <div v-if="icon" :class="icon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  icon?: string
  id?: string
  min?: number
  max?: number
  step?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()

const inputClasses = computed(() => {
  const base = 'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
  const padding = props.icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2'
  const state = props.error
    ? 'border-red-500 dark:border-red-400'
    : 'border-gray-300 dark:border-gray-600'
  const bg = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
  
  return `${base} ${padding} ${state} ${bg}`
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>
