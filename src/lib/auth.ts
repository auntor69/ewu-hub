import { supabase } from './supabase'
import { UserProfile, LoginForm, RegisterForm } from './types'

// Fallback fetch function if supabase client is not available
const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}${endpoint}`
  const headers = {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw error
  }
  return response.json()
}
export class AuthService {
  static async signIn(credentials: LoginForm): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      if (!supabase) {
        // Fallback auth using fetch
        const authData = await supabaseFetch('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          })
        })
        
        if (!authData.user) return { user: null, error: 'Invalid credentials' }
        
        // Get user profile
        const profile = await supabaseFetch(`/rest/v1/profiles?user_id=eq.${authData.user.id}`)
        
        return { user: profile?.[0] || null, error: null }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      
      if (error) return { user: null, error: error.message }
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (profileError) return { user: null, error: 'Profile not found' }
      
      return { user: profile, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  static async signUp(userData: RegisterForm): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      if (!supabase) {
        // Fallback auth using fetch
        const authData = await supabaseFetch('/auth/v1/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
          })
        })
        
        if (!authData.user) return { user: null, error: 'Registration failed' }
        
        // Create profile
        const profile = await supabaseFetch('/rest/v1/profiles', {
          method: 'POST',
          body: JSON.stringify({
            user_id: authData.user.id,
            role: userData.role,
            student_id: userData.studentId,
            faculty_id: userData.facultyId,
          })
        })
        
        return { user: profile?.[0] || null, error: null }
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })
      
      if (error) return { user: null, error: error.message }
      if (!data.user) return { user: null, error: 'Registration failed' }
      
      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          role: userData.role,
          student_id: userData.studentId,
          faculty_id: userData.facultyId,
        })
        .select()
        .single()
      
      if (profileError) return { user: null, error: profileError.message }
      
      return { user: profile, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      if (!supabase) {
        localStorage.removeItem('currentUser')
        return { error: null }
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) return { error: error.message }
      
      localStorage.removeItem('currentUser')
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        const stored = localStorage.getItem('currentUser')
        return stored ? JSON.parse(stored) : null
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      return profile
    } catch (error) {
      return null
    }
  }

  static setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }
}