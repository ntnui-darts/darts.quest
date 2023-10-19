<template>
  <h4 style="margin: 0">No Options</h4>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

defineProps<{ typeAttributes: string[] }>()

const emit = defineEmits<{
  update: [typeAttributes: string[]]
}>()

const update = () => {
  emit('update', [])
}

onMounted(() => {
  update()
})
</script>
