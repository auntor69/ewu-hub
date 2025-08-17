import { supabase } from './supabase'
import { UserProfile, LoginForm, RegisterForm } from './types'

export class AuthService {
  static async signIn(credentials: LoginForm): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
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