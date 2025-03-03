<template>
  <div
    class="combination"
    style="display: flex; font-size: large; font-weight: 500"
  >
    <span class="checkout">{{ checkout }}</span>
    <span v-for="num in combination">{{ num }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ checkout: string; combination: string[] }>()
</script>

<style>
.checkout {
  background-color: var(--c-green) !important;
  color: #1a1a1a;
  border-radius: 8px 0 0 8px;
}

.combination span {
  width: 50px;
  display: block;
  text-align: center;
  background-color: #1a1a1a;
  flex-grow: 0;
}

.combination span:last-child {
  border-radius: 0 8px 8px 0;
}
</style>
