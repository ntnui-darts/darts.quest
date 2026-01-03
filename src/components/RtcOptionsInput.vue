<template>
  <h4 style="margin: 0">Mode</h4>
  <div class="row options">
    <button
      v-for="t in ([1, 2, 3] as const)"
      :class="{ selected: t == mode }"
      @click="
        () => {
          mode = t
        }
      "
    >
      {{ ['Single', 'Double', 'Triple'][t - 1] }}
    </button>
  </div>
  <div class="row">
    <button
      :class="{ selected: random }"
      @click="
        () => {
          random = !random
        }
      "
    >
      Random order
    </button>
  </div>
  <div class="row">
    <button
      :class="{ selected: fast }"
      :disabled="mode != 1 || forced"
      @click="
        () => {
          fast = !fast
        }
      "
    >
      Fast
    </button>
    <button
      :class="{ selected: forced }"
      :disabled="fast"
      @click="
        () => {
          forced = !forced
          fast = false
        }
      "
    >
      Forced
    </button>
  </div>
  <MaxVisitsInput
    v-model:maxVisits="maxVisits"
    v-model:maxVisitsEnabled="maxVisitsEnabled"
  ></MaxVisitsInput>
</template>

<script lang="ts" setup>
import { Multiplier } from '@/types/game'
import {
  getTypeAttribute,
  getTypeAttributeOrDefault,
  pushTypeAttribute,
} from '@/types/typeAttributes'
import { ref, watchEffect } from 'vue'
import MaxVisitsInput from './MaxVisitsInput.vue'

const props = defineProps<{ typeAttributes: string[] }>()

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const random = ref(getTypeAttributeOrDefault(props, 'random'))
const forced = ref(getTypeAttributeOrDefault(props, 'forced'))
const fast = ref(getTypeAttributeOrDefault(props, 'fast'))
const mode = ref(getTypeAttributeOrDefault(props, 'mode'))
const maxVisits = ref(getTypeAttributeOrDefault(props, 'maxVisits'))
const maxVisitsEnabled = ref(!!getTypeAttribute(props, 'maxVisits'))

watchEffect(() => {
  if (mode.value != Multiplier.Single) {
    fast.value = false
  }

  const attributes: string[] = []
  pushTypeAttribute(attributes, 'mode', mode.value)
  pushTypeAttribute(attributes, 'random', random.value)
  pushTypeAttribute(attributes, 'fast', fast.value)
  pushTypeAttribute(attributes, 'forced', forced.value)

  if (maxVisitsEnabled.value) {
    pushTypeAttribute(attributes, 'maxVisits', maxVisits.value)
  }

  emit('update', attributes)
})
</script>
