<template>
  <h3>Status of {{ user.name }}</h3>
  <label for="beers">Beers</label>
  <input id="beers" type="number" style="min-width: 250px" v-model="beers" />
  <label for="arrows">Arrows</label>
  <input id="arrows" type="text" style="min-width: 250px" v-model="arrows" />
  <div class="row">
    <input id="allowRemote" type="checkbox" v-model="allowRemote" />
    <label for="allowRemote">Allow Remote</label>
  </div>
  <br />
  <div class="row">
    <button @click="emit('cancel')">{{ leftButtonText ?? 'Cancel' }}</button>
    <button
      class="primary"
      @click="emit('submit', { beers, arrows, allowRemote })"
    >
      {{ rightButtonText ?? 'Confirm' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import { ref } from 'vue'

const props = defineProps<{
  user: UserCurrentInfo
  leftButtonText?: string
  rightButtonText?: string
}>()

const beers = ref(props.user.beers ?? 0)
const arrows = ref(props.user.arrows ?? 'unknown')
const allowRemote = ref(props.user.allowRemote ?? false)

const emit = defineEmits<{
  cancel: []
  submit: [data: { beers: number; arrows: string; allowRemote: boolean }]
}>()
</script>
