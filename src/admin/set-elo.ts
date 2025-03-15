import { compareCreatedAt } from '@/functions/compare'
import { GameType } from '@/games/games'
import { useAuthStore } from '@/stores/auth'
import { useEloStore } from '@/stores/elo'
import { supabase } from '@/supabase'
import { DbGame, Game } from '@/types/game'
import { Database } from '@/types/supabase'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const setElo = async () => {
  console.log('Starting setElo')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const eloStore = useEloStore()
  const gamesResponse = await supabase.from('games').select('*')
  if (!gamesResponse.data) throw Error()
  const games = gamesResponse.data.toSorted(compareCreatedAt) as DbGame[]
  let i = 0
  for (const game of games) {
    const legCheck = await supabase
      .from('legs')
      .select('id')
      .eq('gameId', game.id)
    if (!legCheck.data?.length) {
      console.info(`No leg for ${game.id}`)
      await supabase.from('games').update({ legs: [] }).eq('id', game.id)
      continue
    }
    //@ts-ignore
    const eloDeltas = await eloStore.updateEloFromGame(game as Game, true)
    for (const eloDelta of eloDeltas) {
      const legIdResponse = await supabase
        .from('legs')
        .select('id')
        .eq('gameId', game.id)
        .eq('userId', eloDelta.userId)
      if (!legIdResponse.data?.length) {
        console.error(`No leg for ${game.id}, ${eloDelta.userId}`)
        continue
      }
      await supabase
        .from(getStatisticsTable(game.type as GameType))
        .update({ eloDelta: eloDelta.eloDelta })
        .eq('id', legIdResponse.data[0].id)
    }
    i += 1
    console.log(`Updated game ${game.id}, ${i}(${games.length})`)
  }
  console.log('Completed migration')
}

const getStatisticsTable = (gameType: GameType): keyof Database['public']['Tables'] => {
  switch (gameType)
  {
    case 'cricket':
      return 'statistics_cricket'
    case 'x01':
      return 'statistics_x01'
    case 'skovhugger':
      return 'statistics_skovhugger'
    case 'rtc':
        return 'statistics_rtc'
    case 'killer':
        return 'statistics_killer'
  }
} 