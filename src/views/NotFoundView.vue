<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div class="i-lucide-search-x mx-auto mb-6 text-8xl text-gray-300 dark:text-gray-600" />
      <h1 class="mb-2 text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
      <p class="mb-8 text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="flex justify-center gap-3">
        <BaseButton @click="router.back()">
          <div class="i-lucide-arrow-left text-lg" />
          Go Back
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/')">
          <div class="i-lucide-home text-lg" />
          Go Home
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
</script>
