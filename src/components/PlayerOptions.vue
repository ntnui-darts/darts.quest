<template>
  <h3>Status of {{ user.name }}</h3>
  <label for="beers">Beers</label>
  <input id="beers" type="number" v-model="beers" />
  <label for="arrows">Arrows</label>
  <input id="arrows" type="text" v-model="arrows" />
  <br />
  <div class="row">
    <button @click="emit('cancel')">Cancel</button>
    <button @click="emit('submit', { beers, arrows })">Confirm</button>
  </div>
</template>

<script lang="ts" setup>
import { User } from '@/stores/users'
import { ref } from 'vue'

const beers = ref(0)
const arrows = ref('unknown')

defineProps<{
  user: User
}>()

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
