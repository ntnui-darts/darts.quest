<template>
  <div class="modal col">
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
import IconButton from './IconButton.vue'
import { useModalStore, DynamicComponent } from '@/stores/modal'

const modalStore = useModalStore()

defineProps<{
  component: DynamicComponent
}>()
</script>

<style scoped>
.modal {
  position: relative;
  background-color: var(--c-background);
  border-radius: 1.5em;
  box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.5);
  min-height: 25%;
  max-height: 80%;
  padding: 2em;
}
</style>
