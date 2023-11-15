import { useAuthStore } from '@/stores/auth'
import { upsertLegStatistics } from '@/stores/stats'
import { supabase } from '@/supabase'
import { Leg } from '@/types/game'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const migrateToStatisticsPerLeg = async () => {
  console.log('Starting migration migrateToStatisticsPerLeg')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const legsResponse = await supabase.from('legs').select('*')
  if (!legsResponse.data) throw Error()
  const legs = legsResponse.data as Leg[]
  legs.forEach(async (leg) => {
    if (leg.type == 'x01') {
      await upsertLegStatistics(leg)
      console.log(`Updated leg ${leg.id}`)
    } else {
      console.log(`Already there.`)
    }
  })
  console.log('Completed migration of legs')
}
