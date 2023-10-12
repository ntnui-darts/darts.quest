import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const migrateScoreOfX01ToTypeAttr = async () => {
  console.log('Starting migration migrateScoreOfX01ToTypeAttr')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const gamesResponse = await supabase.from('games').select('*')
  if (!gamesResponse.data) throw Error()
  const games = gamesResponse.data
  games.forEach(async (game) => {
    console.log(game.type)
    if (!['701', '501', '301'].includes(game.type)) return
    game.typeAttributes.push(`startScore:${game.type}`)
    await supabase
      .from('games')
      .update({ type: 'x01', typeAttributes: game.typeAttributes })
      .eq('id', game.id)
    console.log(`Updated game ${game.id}`)
  })
  console.log('Completed migration of games')

  const legsResponse = await supabase.from('legs').select('*')
  if (!legsResponse.data) throw Error()
  const legs = legsResponse.data
  legs.forEach(async (leg) => {
    console.log(leg.type)
    if (!['701', '501', '301'].includes(leg.type)) return
    leg.typeAttributes.push(`startScore:${leg.type}`)
    await supabase
      .from('games')
      .update({ type: 'x01', typeAttributes: leg.typeAttributes })
      .eq('id', leg.id)
    console.log(`Updated leg ${leg.id}`)
  })
  console.log('Completed migration of legs')
}
