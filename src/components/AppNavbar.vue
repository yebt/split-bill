<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'

defineProps<{
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}>()

const emit = defineEmits<{
  openSettings: []
}>()

function handleOpenSettings() {
  emit('openSettings')
}
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <!-- Left side: Logo/Title or Back button + custom content -->
      <div class="flex items-center gap-3">
        <slot name="left">
          <template v-if="showBackButton">
            <BaseButton variant="ghost" size="sm" @click="onBack">
              <div class="i-lucide-arrow-left text-lg" />
            </BaseButton>
          </template>
          <template v-else>
            <div>
              <img src="@/assets/logo.svg" alt="Logo" class="h-10 w-10" />
            </div>
          </template>
          <h1 class="text-2xl font-bold">{{ title || 'Squad Bill' }}</h1>
        </slot>
      </div>

      <!-- Right side: Actions + Settings button -->
      <div class="flex items-center gap-2">
        <!-- Custom actions slot -->
        <slot name="actions" />

        <!-- Settings button (always visible) -->
        <BaseButton variant="ghost" size="sm" @click="handleOpenSettings">
          <div class="i-lucide-settings text-lg" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>
