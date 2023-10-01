<template>
  <button
    class="btn btn-icon"
    :class="class"
    :style="{ 'background-color': color }"
    @click="emit('click')"
  >
    <!-- TODO -->
    <!-- <fa-icon v-if="!hidden" :size="size" :icon="icon" /> -->
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    icon?: string;
    size?: string;
    hidden?: boolean;
    class?: string | object;
    color?: string;
  }>(),
  {
    icon: 'angle-left',
    color: 'var(--c-white)',
  }
);
const emit = defineEmits<{ (e: 'click'): void }>();
</script>
