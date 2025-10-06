<script lang="ts">
import { useCurrencyInput } from 'vue-currency-input'
import { type CurrencyInputOptions, CurrencyDisplay } from 'vue-currency-input'

interface Props {
  modelValue: number
  options: CurrencyInputOptions
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  options: () => ({
    currency: 'USD',
    currencyDisplay: CurrencyDisplay.narrowSymbol,
    currencySign: false,
    hideCurrencySymbolOnFocus: false,
    hideGroupingSeparatorOnFocus: false,
    hideNegligibleDecimalDigitsOnFocus: true,
    // autoDecimalDigits: false,
    // useGrouping: true,
    // accountingSign: false,
  }),
})

// export default {
//   name: 'CurrencyInput',
//   props: {
//     modelValue: Number, // Vue 2: value
//     options: Object,
//   },
//   setup(props) {
//     const { inputRef } = useCurrencyInput(props.options)
//     return { inputRef }
// }
useCurrencyInput(props.options)
</script>
<template>
  <input ref="inputRef" type="text" />
</template>
