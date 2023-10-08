// import { useAuthStore } from '@/stores/auth'
// import { supabase } from '@/supabase'

// const email = import.meta.env.VITE_EMAIL
// const password = import.meta.env.VITE_PASSWORD

export const migrateTypeToArray = async () => {
  throw Error('deprecated')

  // console.log('Starting migration migrateTypeToArray')
  // const authStore = useAuthStore()
  // await authStore.signIn(email, password)
  // const id = useAuthStore().auth?.id
  // if (!id) throw Error()

  // const gamesResponse = await supabase.from('games').select('*')
  // if (!gamesResponse.data) throw Error()
  // const games = gamesResponse.data
  // games.forEach(async (game) => {
  //   const typeArray = [
  //     game.type == 'Round the Clock'
  //       ? `mode:${game.finishType}`
  //       : `finish:${game.finishType}`,
  //   ]
  //   await supabase.from('games').update({ typeArray }).eq('id', game.id)
  //   console.log(`Updated game ${game.id}`)
  // })
  // console.log('Completed migration of games')

  // const legsResponse = await supabase.from('legs').select('*')
  // if (!legsResponse.data) throw Error()
  // const legs = legsResponse.data
  // legs.forEach(async (leg) => {
  //   const typeArray = [
  //     leg.type == 'Round the Clock'
  //       ? `mode:${leg.finishType}`
  //       : `finish:${leg.finishType}`,
  //   ]
  //   await supabase.from('legs').update({ typeArray }).eq('id', leg.id)
  //   console.log(`Updated leg ${leg.id}`)
  // })
  // console.log('Completed migration of legs')
}
