<template>
  <h4 style="margin: 0">Start Score</h4>
  <div class="row options">
    <button
      v-for="value in ([301, 501, 701] as const)"
      :class="{ selected: value == startScore }"
      @click="
        () => {
          startScore = value
        }
      "
    >
      {{ value }}
    </button>
  </div>
  <h4 style="margin: 0">Finish</h4>
  <div class="row options">
    <button
      v-for="value in ([1, 2, 3] as const)"
      :class="{ selected: value == finish }"
      @click="
        () => {
          finish = value
        }
      "
    >
      {{ ['Single', 'Double', 'Triple'][value - 1] }}
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
import { getTypeAttribute } from '@/types/game'
import { ref, watch } from 'vue'

const props = defineProps<{ typeAttributes: string[] }>()

const finish = ref<1 | 2 | 3>(getTypeAttribute<1 | 2 | 3>(props, 'finish', 2))
const startScore = ref<301 | 501 | 701>(
  getTypeAttribute<301 | 501 | 701>(props, 'startScore', 501)
)
const maxVisits = ref<number>(getTypeAttribute<number>(props, 'maxVisits', 20))
const maxVisitsEnabled = ref(
  getTypeAttribute<number>(props, 'maxVisits', 0) > 0
)

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

watch(
  () => [
    startScore.value,
    finish.value,
    maxVisitsEnabled.value,
    maxVisits.value,
  ],
  () => {
    const attrs = [`startScore:${startScore.value}`, `finish:${finish.value}`]
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
