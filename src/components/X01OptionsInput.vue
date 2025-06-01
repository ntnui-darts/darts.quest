<template>
  <h4 style="margin: 0">Start Score</h4>
  <div class="row options">
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
  <div class="row options">
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
  <div class="text-input">
    <h4>Max visits (leave blank for no max)</h4>
    <input type="number" />
  </div>
</template>

<script lang="ts" setup>
import { getTypeAttribute } from '@/types/game'
import { onMounted, ref } from 'vue'

const props = defineProps<{ typeAttributes: string[] }>()

const finish = ref<1 | 2 | 3>(getTypeAttribute<1 | 2 | 3>(props, 'finish', 2))
const startScore = ref<301 | 501 | 701>(
  getTypeAttribute<301 | 501 | 701>(props, 'startScore', 501)
)
const maxVisitsInput = ref<string>('')

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const update = () => {
  const attrs = [`startScore:${startScore.value}`, `finish:${finish.value}`]

  const parsed = parseInt(maxVisitsInput.value)
  if (!isNaN(parsed)) {
    attrs.push(`maxVisits:${parsed}`)
  }
  emit('update', attrs)
}

onMounted(() => {
  update()
})
</script>
