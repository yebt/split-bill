<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'

// Initialize theme store
useThemeStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <RouterView />
  </div>
</template>
