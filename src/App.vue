<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useHead } from '@unhead/vue'

// Initialize theme store
useThemeStore()

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
    // Basic meta tags
    { name: 'description', content: siteDescription },
    { name: 'keywords', content: 'split bill, expense tracker, bill splitting, group expenses, parche' },
    { name: 'author', content: 'Split Bill' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
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
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
/* View transitions for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* View Transitions API for modern browsers */
@media (prefers-reduced-motion: no-preference) {
  @supports (view-transition-name: none) {
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.3s;
      animation-timing-function: ease-in-out;
    }

    ::view-transition-old(root) {
      animation-name: slide-out;
    }

    ::view-transition-new(root) {
      animation-name: slide-in;
    }

    @keyframes slide-out {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
}
</style>
