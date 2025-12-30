<template>
  <h4 style="margin: 0">Mode</h4>
  <div class="row options">
    <button
      v-for="t in ([1, 2, 3] as const)"
      :class="{ selected: t == mode }"
      @click="
        () => {
          mode = t
          update()
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
          update()
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
          update()
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
          update()
        }
      "
    >
      Forced
    </button>
  </div>
</template>

<script lang="ts" setup>
import { getTypeAttributeOrDefault } from '@/types/typeAttributes'
import { onMounted, ref } from 'vue'

const props = defineProps<{ typeAttributes: string[] }>()

const random = ref(getTypeAttributeOrDefault(props, 'random'))
const forced = ref(getTypeAttributeOrDefault(props, 'forced'))
const fast = ref(getTypeAttributeOrDefault(props, 'fast'))
const mode = ref(getTypeAttributeOrDefault(props, 'mode'))

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const update = () => {
  if (mode.value != 1) {
    fast.value = false
  }
  emit('update', [
    `mode:${mode.value}`,
    `random:${random.value}`,
    `fast:${fast.value}`,
    `forced:${forced.value}`,
  ])
}

onMounted(() => {
  update()
})
</script>
