import { supabase } from './supabase';
import { UserProfile, LoginForm, RegisterForm } from './types';

export class AuthService {
  // TODO: Connect to Supabase Auth
  static async signIn(credentials: LoginForm): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: credentials.email,
      //   password: credentials.password,
      // });
      
      // if (error) return { user: null, error: error.message };
      
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', data.user.id)
      //   .single();
      
      // return { user: profile, error: null };
      
      return { user: null, error: 'Authentication not implemented yet' };
    } catch (error) {
      return { user: null, error: 'Authentication failed' };
    }
  }

  static async signUp(userData: RegisterForm): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      // TODO: Connect to Supabase Auth
      // const { data, error } = await supabase.auth.signUp({
      //   email: userData.email,
      //   password: userData.password,
      // });
      
      // if (error) return { user: null, error: error.message };
      
      // const profile = {
      //   id: data.user.id,
      //   name: userData.name,
      //   email: userData.email,
      //   role: userData.role,
      //   student_id: userData.studentId,
      //   faculty_id: userData.facultyId,
      // };
      
      // const { data: newProfile, error: profileError } = await supabase
      //   .from('profiles')
      //   .insert(profile)
      //   .select()
      //   .single();
      
      // if (profileError) return { user: null, error: profileError.message };
      
      // return { user: newProfile, error: null };
      
      return { user: null, error: 'Registration not implemented yet' };
    } catch (error) {
      return { user: null, error: 'Registration failed' };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      // TODO: Connect to Supabase Auth
      // const { error } = await supabase.auth.signOut();
      // if (error) return { error: error.message };
      
      localStorage.removeItem('currentUser');
      return { error: null };
    } catch (error) {
      return { error: 'Sign out failed' };
    }
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      // TODO: Connect to Supabase Auth
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return null;
      
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();
      
      // return profile;
      
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  static setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }
}