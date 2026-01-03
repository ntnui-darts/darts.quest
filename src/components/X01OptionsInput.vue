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
  <MaxVisitsInput
    v-model:maxVisits="maxVisits"
    v-model:maxVisitsEnabled="maxVisitsEnabled"
  ></MaxVisitsInput>
</template>

<script lang="ts" setup>
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

const finish = ref(getTypeAttributeOrDefault(props, 'finish'))
const startScore = ref(getTypeAttributeOrDefault(props, 'startScore'))
const maxVisits = ref(getTypeAttributeOrDefault(props, 'maxVisits'))
const maxVisitsEnabled = ref(!!getTypeAttribute(props, 'maxVisits'))

watchEffect(() => {
  const attributes: string[] = []
  pushTypeAttribute(attributes, 'startScore', startScore.value)
  pushTypeAttribute(attributes, 'finish', finish.value)

  if (maxVisitsEnabled.value) {
    pushTypeAttribute(attributes, 'maxVisits', maxVisits.value)
  }

  emit('update', attributes)
})
</script>
