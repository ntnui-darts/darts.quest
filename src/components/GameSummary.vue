<template>
  <div style="display: flex; justify-content: end">
    <ExitIcon @click="useModalStore().pop"></ExitIcon>
  </div>
  <div style="overflow-x: hidden; overflow-y: auto">
    <div v-if="props.game.type == 'x01' || props.game.type == 'rtc'">
      <DartboardChart :visits="props.leg.visits" :statType="props.leg.type">
      </DartboardChart>
    </div>
    <div>
      <h3>Game information</h3>
      Participants:
      {{
        props.game.players
          .map((player) => usersStore.getName(player))
          .join(', ')
      }}
      <div v-if="game.tournamentId">
        Tournament:
        {{ useTournamentStore().getTournamentName(game.tournamentId) }}
      </div>
      <div>Game mode: {{ game.type }}</div>
      <div v-for="attribute in game.typeAttributes">
        {{ formatAttribute(attribute) }}
      </div>
    </div>
    <div>
      <h3>Personal statistics</h3>
      <div v-for="[key, value] in statEntries">
        <span>{{ formatStat(key, value) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import ExitIcon from './ExitIcon.vue'
import { DbGame, Leg } from '@/types/game'
import DartboardChart from './DartboardChart.vue'
import { supabase } from '@/supabase'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { GameType } from '@/games/games'
import { Database } from '@/types/supabase'
import { useUsersStore } from '@/stores/users'
import { useTournamentStore } from '@/stores/tournament'

const props = defineProps<{
  leg: Leg
  game: DbGame
}>()

const usersStore = useUsersStore()

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

const keyMap: Record<string, string> = {
  startScore: 'Start score',
  finish: 'Finish',
  maxVisits: 'Max visits',
  forced: 'Forced',
  fast: 'Fast',
  mode: 'Segments',
}

const finishMap: Record<number, string> = {
  1: 'Single',
  2: 'Double',
  3: 'Triple',
}

const ordinal = (value: number) => {
  value = Math.round(value)
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
      displayValue = `${ordinal(placement)} / ${playerCt} players`
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

const formatAttribute = (attribute: string) => {
  const [rawKey, rawValue] = attribute.split(':')
  if (!keyMap[rawKey]) {
    return ''
  }
  const key = keyMap[rawKey]

  switch (rawValue) {
    case 'false':
      return ''
    case 'true':
      return key
  }

  const value = Number(rawValue)

  if (rawKey == 'finish' || rawKey == 'mode') {
    return [key, finishMap[value]].join(': ')
  }

  return [key, value].join(': ')
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
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const statEntries = computed(() => {
  if (!stats.value || typeof stats != 'object') return []
  return Object.entries(stats.value)
})
</script>
