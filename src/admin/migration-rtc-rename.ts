import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const migrateRenameRtc = async () => {
  console.log('Starting migration migrateRenameRtc')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const gamesResponse = await supabase.from('games').select('*')
  if (!gamesResponse.data) throw Error()
  const games = gamesResponse.data
  games.forEach(async (game) => {
    if (game.type == 'Round the Clock') {
      await supabase.from('games').update({ type: 'rtc' }).eq('id', game.id)
    }
    console.log(`Updated game ${game.id}`)
  })
  console.log('Completed migration of games')

  const legsResponse = await supabase.from('legs').select('*')
  if (!legsResponse.data) throw Error()
  const legs = legsResponse.data
  legs.forEach(async (leg) => {
    if (leg.type == 'Round the Clock') {
      await supabase.from('legs').update({ type: 'rtc' }).eq('id', leg.id)
    }
    console.log(`Updated leg ${leg.id}`)
  })
  console.log('Completed migration of legs')
}
