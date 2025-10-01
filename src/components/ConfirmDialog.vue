<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    :close-on-backdrop="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="text-gray-700 dark:text-gray-300">
      {{ message }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="ghost" @click="cancel">
          {{ cancelText }}
        </BaseButton>
        <BaseButton :variant="confirmVariant" @click="confirm">
          {{ confirmText }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmVariant: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
