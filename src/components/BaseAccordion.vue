<template>
  <div class="overflow-hidden rounded-lg border" :style="{ borderColor: color }">
    <!-- Header -->
    <button
      type="button"
      class="flex w-full items-center justify-between px-4 py-3 transition-colors hover:opacity-90"
      :style="{ backgroundColor: color }"
      @click="toggle"
    >
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        <span v-if="badge" class="text-sm text-white opacity-90">({{ badge }})</span>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <div
          class="i-lucide-chevron-down text-2xl text-white transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </button>

    <!-- Content -->
    <Transition name="accordion">
      <div v-if="isOpen" class="bg-white dark:bg-gray-800">
        <div class="p-4">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  title: string
  color: string
  badge?: string | number
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
  },
)

function toggle() {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
