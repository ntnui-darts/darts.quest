<template>
  <h3>Status of {{ user.name }}</h3>
  <label for="beers">Beers</label>
  <input id="beers" type="number" v-model="beers" />
  <label for="arrows">Arrows</label>
  <input id="arrows" type="text" v-model="arrows" />
  <br />
  <div class="row">
    <button @click="emit('cancel')">{{ leftButtonText ?? 'Cancel' }}</button>
    <button class="selected" @click="emit('submit', { beers, arrows })">
      {{ rightButtonText ?? 'Confirm' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UserCurrentInfo } from '@/components/PlayerSelection.vue'

const props = defineProps<{
  user: UserCurrentInfo
  leftButtonText?: string
  rightButtonText?: string
}>()

const beers = ref(props.user.beers ?? 0)
const arrows = ref(props.user.arrows ?? 'unknown')

const emit = defineEmits<{
  cancel: []
  submit: [data: { beers: number; arrows: string }]
}>()
</script>

<style>
input {
  min-width: 250px;
}
</style>
