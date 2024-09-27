<template>
  <PlayerSelection v-model:players="players" :readonly="true"></PlayerSelection>
  <hr style="min-width: 300px; visibility: hidden" />
  <button class="primary" @click="emit('submit', players)">Submit</button>
  <br />
</template>

<script lang="ts" setup>
import { useUsersStore } from '@/stores/users'
import { ref } from 'vue'
import PlayerSelection, { UserCurrentInfo } from './PlayerSelection.vue'

const props = defineProps<{
  playerIds: string[]
}>()

const emit = defineEmits<{
  (e: 'submit', players: UserCurrentInfo[]): void
}>()

const players = ref(
  props.playerIds.map((p) => useUsersStore().getUser(p)).filter((u) => !!u)
)
</script>
