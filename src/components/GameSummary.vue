<template>
  <div style="display: flex; justify-content: end">
    <ExitIcon @click="useModalStore().pop"></ExitIcon>
  </div>
  <div v-if="props.game.type == 'x01' || props.game.type == 'rtc'">
    <DartboardChart :visits="props.leg.visits" :statType="props.leg.type">
    </DartboardChart>
  </div>
  <div v-if="statEntries.length">
    <div v-for="[key, value] in statEntries">
      <span>{{ formatStat(key, value) }}</span>
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
  game: DbGame
}>()

const tableMap: Record<GameType, keyof Database['public']['Tables']> = {
  x01: 'statistics_x01',
  rtc: 'statistics_rtc',
  killer: 'statistics_killer',
  skovhugger: 'statistics_skovhugger',
  cricket: 'statistics_cricket',
}
const labelMap: Record<string, string> = {
  id: '',
  darts: 'Darts',
  maxVisitScore: 'Highest visit',
  first9Avg: 'First 9 average',
  checkout: 'Checkout',
  winRate: 'Placement',
  eloDelta: 'Rating change',
  maxStreak: 'Longest streak',
  hitRate: 'Hit rate',
  score: 'Score',
}
const ordinal = (value: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = value % 100
  return value + (s[(v - 20) % 10] || s[v] || s[0])
}

const formatStat = (key: string, value: any): string => {
  if (!labelMap[key]) return ''
  const label = labelMap[key]
  let displayValue = (Math.round(value * 100) / 100).toString()
  switch (key) {
    case 'winRate':
      const playerCt = props.game.players.length
      const placement = 1 + (1 - value) * (props.game.players.length - 1)
      displayValue = `${ordinal(placement)} / ${playerCt}`
      break
    case 'eloDelta':
      if (value == 0) {
        return ''
      }
      displayValue = `${value > 0 ? `+${displayValue}` : displayValue}`
      break
    case 'checkout':
      if (value == 0) {
        return ''
      }
      break
  }
  return `${label}: ${displayValue}`
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
