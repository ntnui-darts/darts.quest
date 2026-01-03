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
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2em;
    "
  >
    <div style="display: flex; gap: 1em">
      <input
        id="checkbox-max-visits"
        type="checkbox"
        v-model="maxVisitsEnabled"
      />
      <label style="margin: 0; font-weight: bold" for="checkbox-max-visits"
        >Max Visits</label
      >
    </div>
    <input
      style="flex: 1"
      :style="{ visibility: maxVisitsEnabled ? 'visible' : 'hidden' }"
      type="number"
      :min="3"
      :max="1000"
      :step="1"
      v-model="maxVisits"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  getTypeAttribute,
  getTypeAttributeOrDefault,
} from '@/types/typeAttributes'
import { ref, watch } from 'vue'

const props = defineProps<{ typeAttributes: string[] }>()

const random = ref(getTypeAttributeOrDefault(props, 'random'))
const forced = ref(getTypeAttributeOrDefault(props, 'forced'))
const fast = ref(getTypeAttributeOrDefault(props, 'fast'))
const mode = ref(getTypeAttributeOrDefault(props, 'mode'))
const maxVisits = ref(getTypeAttributeOrDefault(props, 'maxVisits'))
const maxVisitsEnabled = ref(!!getTypeAttribute(props, 'maxVisits'))

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

watch(
  () => [
    mode.value,
    random.value,
    fast.value,
    forced.value,
    maxVisitsEnabled.value,
    maxVisits.value,
  ],
  () => {
    if (mode.value != 1) {
      fast.value = false
    }

    const attrs = [
      `mode:${mode.value}`,
      `random:${random.value}`,
      `fast:${fast.value}`,
      `forced:${forced.value}`,
    ]

    const validatedMaxVisits =
      !!maxVisits.value && isFinite(maxVisits.value)
        ? Math.round(Math.min(Math.max(3, maxVisits.value), 1000))
        : 0

    if (maxVisitsEnabled.value && validatedMaxVisits > 0) {
      attrs.push(`maxVisits:${maxVisits.value}`)
    }

    emit('update', attrs)
  },
  { immediate: true }
)
</script>
