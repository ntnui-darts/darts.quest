import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

const SUPABASE_URL = 'https://euetpcqmwfdwvbjdqufo.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZXRwY3Ftd2Zkd3ZiamRxdWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU5ODM1NDIsImV4cCI6MjAxMTU1OTU0Mn0.aM9v_wWazWbIcIMHSAcXcITjSLpvsVrwRtCIuEdaeuc'
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
