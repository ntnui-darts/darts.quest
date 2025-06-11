<template>
  <div style="display: flex; justify-content: end">
    <ExitIcon @click="useModalStore().pop"></ExitIcon>
  </div>
  <DartboardChart :visits="props.leg.visits" :statType="props.leg.type">
  </DartboardChart>
  <div v-if="statEntries.length">
    <div v-for="[key, value] in statEntries">
      <span>{{ key }}: {{ value }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import ExitIcon from './ExitIcon.vue'
import { DbGame, Leg } from '@/types/game'
import DartboardChart from './DartboardChart.vue'
import { supabase } from '@/supabase'
import { computed, onMounted, ref } from 'vue'
import { GameType } from '@/games/games'
import { Database } from '@/types/supabase'

const props = defineProps<{
  leg: Leg
  game: DbGame | undefined
}>()

const tableMap: Record<GameType, keyof Database['public']['Tables']> = {
  x01: 'statistics_x01',
  rtc: 'statistics_rtc',
  killer: 'statistics_killer',
  skovhugger: 'statistics_skovhugger',
  cricket: 'statistics_cricket',
}

const table = tableMap[props.leg.type]
const stats = ref<any>(null)

onMounted(async () => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', props.leg.id)
    .single()
  if (!error) {
    stats.value = data
  }
})

const statEntries = computed(() => {
  if (!stats.value || typeof stats != 'object') return []
  return Object.entries(stats.value)
})
</script>
