<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useHead } from '@unhead/vue'

// Initialize theme store
useThemeStore()
// i try use the basics head
useHead({
  bodyAttrs: {
    style: 'background: salmon; color: cyan;',
  },
  meta: [{ name: 'description', content: 'App to management Parches and bills' }],
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
