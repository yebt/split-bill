<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="color in colors"
        :key="color"
        type="button"
        :class="[
          'w-10 h-10 rounded-full border-2 transition-all',
          modelValue === color
            ? 'border-gray-900 dark:border-gray-100 scale-110'
            : 'border-transparent hover:scale-105',
        ]"
        :style="{ backgroundColor: color }"
        @click="$emit('update:modelValue', color)"
      >
        <div v-if="modelValue === color" class="i-lucide-check text-white text-lg mx-auto" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GROUP_COLORS } from '@/types/domain'

interface Props {
  modelValue: string
  label?: string
  colors?: readonly string[]
}

withDefaults(defineProps<Props>(), {
  colors: () => GROUP_COLORS,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
