<template>
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

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const update = () => {
  emit('update', [`finish:${finish.value}`])
}

onMounted(() => {
  update()
})
</script>
