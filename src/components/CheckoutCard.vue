<template>
  <div
    style="
      max-width: 500px;
      max-height: 100%;
      display: flex;
      flex-direction: column;
    "
  >
    <h2>Checkout Card</h2>
    <div class="row" style="margin-bottom: 1rem">
      <button
        v-for="checkoutType in CheckoutTypes"
        :class="{ selected: currentCheckoutType == checkoutType }"
        style="font-size: larger; min-width: 140px"
        @click="setNumDartsCheckout(checkoutType)"
      >
        {{ checkoutType }}
      </button>
    </div>
    <div v-auto-animate style="flex-grow: 1; overflow: auto">
      <div
        :key="currentCheckoutType"
        style="
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: space-around;
        "
      >
        <CheckoutCombination
          v-for="checkout in checkouts[currentCheckoutType]"
          :checkout="checkout.checkout"
          :combination="checkout.combination"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { checkouts } from '@/data/checkouts'
import { ref } from 'vue'
import CheckoutCombination from './CheckoutCombination.vue'

type CheckoutType = '2 darts' | '3 darts'
const CheckoutTypes = ['2 darts', '3 darts'] satisfies CheckoutType[]

const currentCheckoutType = ref<CheckoutType>('2 darts')

const setNumDartsCheckout = (numDarts: CheckoutType) => {
  currentCheckoutType.value = numDarts
}
</script>
