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
import { getTypeAttribute } from '@/types/game'
import { onMounted, ref } from 'vue'

const props = defineProps<{ typeAttributes: string[] }>()

const random = ref(getTypeAttribute<boolean>(props, 'random', false))
const forced = ref(getTypeAttribute<boolean>(props, 'forced', false))
const fast = ref(getTypeAttribute<boolean>(props, 'fast', false))
const mode = ref<1 | 2 | 3>(getTypeAttribute<1 | 2 | 3>(props, 'mode', 1))

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
