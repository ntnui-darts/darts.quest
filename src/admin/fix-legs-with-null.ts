import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'
import { Visit } from '@/types/game'

const email = import.meta.env.VITE_EMAIL
const password = import.meta.env.VITE_PASSWORD

export const fixLegsWithNullVisits = async () => {
  console.log('Starting migration fixLegsWithNullVisits')
  const authStore = useAuthStore()
  await authStore.signIn(email, password)
  const id = useAuthStore().auth?.id
  if (!id) throw Error()

  const legsResponse = await supabase.from('legs').select('*')
  if (!legsResponse.data) throw Error()
  const legs = legsResponse.data
  legs.forEach(async (leg) => {
    let visits = leg.visits as Visit[]
    if (!visits || !visits.some((v) => v.every((s) => s == null))) return

    visits = visits.filter((v) => !v.every((s) => s == null))
    await supabase.from('legs').update({ visits }).eq('id', leg.id)
    console.log(`Updated leg ${leg.id}`)
  })
  console.log('Completed migration of legs')
}
