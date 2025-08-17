import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error.code === '23505') {
    return 'This booking conflicts with an existing reservation'
  }
  
  if (error.code === 'PGRST116') {
    return 'No data found'
  }
  
  if (error.message?.includes('booking_limit')) {
    return 'Daily booking limit exceeded'
  }
  
  if (error.message?.includes('time_overlap')) {
    return 'Time slot conflicts with existing booking'
  }
  
  return error.message || 'An unexpected error occurred'
}