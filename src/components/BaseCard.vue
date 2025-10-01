<template>
  <div :class="cardClasses" @click="$emit('click', $event)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  clickable: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const base = 'rounded-lg transition-all'
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    outlined: 'border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  
  const clickableClass = props.clickable
    ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600'
    : ''
  
  return `${base} ${variants[props.variant]} ${paddings[props.padding]} ${clickableClass}`
})
</script>
