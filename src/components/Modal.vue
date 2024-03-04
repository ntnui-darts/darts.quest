<template>
  <div class="modal col shadow">
    <div style="position: absolute; right: 0.5em; top: 0.5em">
      <IconButton size="lg" icon="xmark" @click="modalStore.pop"></IconButton>
    </div>
    <component
      :is="component.component"
      v-bind="component.props"
      v-on="component.emits"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { DynamicComponent, useModalStore } from '@/stores/modal'
import IconButton from './IconButton.vue'

const modalStore = useModalStore()

defineProps<{
  component: DynamicComponent
}>()
</script>

<style scoped>
.modal {
  position: relative;
  background-color: var(--c-background);
  border-radius: 1em;
  min-height: 25%;
  max-height: 80%;
  padding: 1em 2em;
  margin: 1em;
}
</style>
