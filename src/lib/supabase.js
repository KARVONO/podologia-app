import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wrhsocyugeuhlfhhgvmt.supabase.co'
const SUPABASE_KEY = 'sb_publishable_q8QcH0pBNekeTv_hVDft5g_5up5igTW'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
