<template>
  <div
    class="overlay"
    :class="{
      'modal-wrapper-background': modalStore.components.length > 0,
      clickthrough: modalStore.components.length == 0,
    }"
    style="transition: all 200ms; height: 100%"
    @click="modalStore.pop"
  ></div>
  <div
    v-for="component in modalStore.components"
    class="overlay clickthrough modal-wrapper col center"
    style="height: 100%"
  >
    <Modal :component="component"></Modal>
  </div>
</template>

<script lang="ts" setup>
import Modal from '@/components/Modal.vue';
import { useModalStore } from '@/stores/modal';

const modalStore = useModalStore();
</script>

<style scoped>
.overlay {
  position: absolute;
  width: 100%;
}

.modal-wrapper {
  position: fixed;
  z-index: 999;
  justify-content: center;
  align-items: center;
}

.modal-wrapper-background {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>
