<template>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2em;
    "
  >
    <div style="display: flex; gap: 1em">
      <input
        id="checkbox-max-visits"
        type="checkbox"
        v-model="maxVisitsEnabled"
      />
      <label style="margin: 0; font-weight: bold" for="checkbox-max-visits"
        >Max Visits</label
      >
    </div>
    <input
      style="flex: 1"
      :style="{ visibility: maxVisitsEnabled ? 'visible' : 'hidden' }"
      type="number"
      :min="3"
      :max="1000"
      :step="1"
      v-model="maxVisits"
    />
  </div>
</template>

<script lang="ts" setup>
const maxVisits = defineModel<number>('maxVisits', { required: true })
const maxVisitsEnabled = defineModel<boolean>('maxVisitsEnabled', {
  required: true,
})
</script>
