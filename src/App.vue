<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useHead } from '@unhead/vue'

// Initialize theme store
useThemeStore()
// i try use the basics head
useHead({
  bodyAttrs:{
    style: 'background: salmon; color: cyan;'
  },
  meta: [
    { name: 'description' , content: 'App to management Parches and bills' },
    // og

  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <RouterView />
  </div>
</template>
