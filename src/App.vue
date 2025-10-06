<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useHead } from '@unhead/vue'
import SplashScreen from '@/components/SplashScreen.vue'

// Initialize theme store
useThemeStore()

// Get router instance
const router = useRouter()

// Define async component that waits for router to be ready
const AppMain = defineAsyncComponent({
  loader: async () => {
    await router.isReady()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return import('@/components/AppMain.vue')
  },
})

// Configure SEO and social media meta tags
const siteTitle = 'Split Bill'
const siteDescription =
  'Easily split bills and manage expenses with your friends. Track who owes what and settle up with your parche.'
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://split-bill.app'
const ogImage = `${siteUrl}/preivew/og-image.jpg`

useHead({
  title: siteTitle,
  // titleTemplate: (title) => (title ? `${title} | ${siteTitle}` : siteTitle),
  meta: [
    // Favicon
    { name: 'msapplication-TileColor', content: '#2563eb' },
    { name: 'theme-color', content: '#2563eb' },

    // Basic meta tags
    { name: 'description', content: siteDescription },
    {
      name: 'keywords',
      content: 'split bill, expense tracker, bill splitting, group expenses, parche',
    },
    { name: 'author', content: 'Split Bill' },
    // { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#2563eb' },

    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: siteUrl },
    { property: 'og:title', content: siteTitle },
    { property: 'og:description', content: siteDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Split Bill - Expense Tracker' },
    { property: 'og:site_name', content: siteTitle },
    { property: 'og:locale', content: 'en_US' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: siteUrl },
    { name: 'twitter:title', content: siteTitle },
    { name: 'twitter:description', content: siteDescription },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: 'Split Bill - Expense Tracker' },
  ],
  link: [
    { rel: 'canonical', href: siteUrl },

    // Favicons
    { rel: 'icon', href: '/favicons/favicon.ico' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
})
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
