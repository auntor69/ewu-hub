import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error.code === '42501') {
    return 'Permission denied. Please sign in again.'
  }
  
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
  
  if (error.message?.includes('opening_hours')) {
    return 'Booking must be within opening hours (Sun-Thu, 08:00-19:00)'
  }
  
  if (error.message?.includes('duration')) {
    return 'Invalid booking duration'
  }
  
  return error.message || 'An unexpected error occurred'
}