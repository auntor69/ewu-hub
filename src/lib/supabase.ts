// TODO: Initialize Supabase client
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Temporary mock client for development
export const supabase = {
  auth: {
    signUp: async (credentials: any) => ({ data: null, error: null }),
    signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: null } }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({ data: [], error: null }),
        }),
      }),
      order: (column: string, options?: any) => ({
        limit: (count: number) => ({ data: [], error: null }),
      }),
      limit: (count: number) => ({ data: [], error: null }),
    }),
    insert: (values: any) => ({
      select: () => ({ single: async () => ({ data: null, error: null }) }),
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({ data: null, error: null }),
    }),
  }),
};