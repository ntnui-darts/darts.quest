import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'
import { Visit } from '@/types/game'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const migrateResignedToForcedCompletion = async () => {
  console.log('Starting migration migrateResignedToForcedCompletion')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const legsResponse = await supabase.from('legs').select('*')
  if (!legsResponse.data) throw Error()

  const legs = legsResponse.data
  legs.forEach(async (leg) => {
    let visits = leg.visits as Visit[]
    if (!visits) return

    const lastVisit = visits.at(-1)
    if (lastVisit && lastVisit.includes('resigned')) {
      const updatedLastVisit = lastVisit.map((segment) => {
        return segment == 'resigned'
          ? { reason: 'resigned', value: 0 }
          : segment
      }) as Visit
      visits[visits.length - 1] = updatedLastVisit
      await supabase.from('legs').update({ visits }).eq('id', leg.id)
      console.log(`Updated leg ${leg.id}`)
    }
  })
  console.log('Completed migration of legs')
}
