<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import SplashScreen from '@/components/SplashScreen.vue'
import { useHeadTags } from './utils/head'

// Initialize theme store
useThemeStore()

// Get router instance
const router = useRouter()

// Define async component that waits for router to be ready
const AppMain = defineAsyncComponent({
  loader: async () => {
    await router.isReady()
    await new Promise((resolve) => setTimeout(resolve, 300))
    return import('@/components/AppMain.vue')
  },
})

// Load head tags
useHeadTags()
</script>

<template>
  <Suspense>
    <AppMain />
    <template #fallback>
      <SplashScreen />
    </template>
  </Suspense>
</template>

<style></style>
