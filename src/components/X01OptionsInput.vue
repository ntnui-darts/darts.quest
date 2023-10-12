<template>
  <h4 style="margin: 0">Start Score</h4>
  <div class="row">
    <button
      v-for="t in ([301, 501, 701] as const)"
      :class="{ selected: t == startScore }"
      @click="
        () => {
          startScore = t
          update()
        }
      "
    >
      {{ t }}
    </button>
  </div>
  <h4 style="margin: 0">Finish</h4>
  <div class="row">
    <button
      v-for="t in ([1, 2, 3] as const)"
      :class="{ selected: t == finish }"
      @click="
        () => {
          finish = t
          update()
        }
      "
    >
      {{ ['Single', 'Double', 'Triple'][t - 1] }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const finish = ref<1 | 2 | 3>(2)
const startScore = ref<301 | 501 | 701>(301)

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const update = () => {
  emit('update', [`startScore:${startScore.value}`, `finish:${finish.value}`])
}

onMounted(() => {
  update()
})
</script>
