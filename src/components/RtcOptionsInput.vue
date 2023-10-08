<template>
  <h4 style="margin: 0">Mode</h4>
  <div class="row">
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
      :disabled="mode != 1"
      @click="
        () => {
          fast = !fast
          update()
        }
      "
    >
      Fast
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const random = ref(false)
const fast = ref(false)
const mode = ref<1 | 2 | 3>(1)

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
  ])
}

onMounted(() => {
  update()
})
</script>
