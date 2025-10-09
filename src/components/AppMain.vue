<script setup lang="ts">
import { ref, provide, type Ref } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import SettingsDrawer from '@/components/SettingsDrawer.vue'

export interface NavbarConfig {
  title: string
  showBackButton: boolean
  onBack?: () => void
}

const showSettings = ref(false)

// Provide navbar configuration
const navbarConfig: Ref<NavbarConfig> = ref({
  title: 'Squad Bill',
  showBackButton: false,
  onBack: undefined,
})

provide('navbarConfig', navbarConfig)

function openSettings() {
  showSettings.value = true
}
</script>

<template>
  <div
    class="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
  >
    <!-- Navbar -->
    <AppNavbar
      :title="navbarConfig.title"
      :show-back-button="navbarConfig.showBackButton"
      :on-back="navbarConfig.onBack"
      @open-settings="openSettings"
    >
      <!-- Slots will be filled by views using teleport -->
    </AppNavbar>

    <!-- Main Content -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade-fast" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- Settings Drawer -->
    <SettingsDrawer v-model="showSettings" />
  </div>
</template>
