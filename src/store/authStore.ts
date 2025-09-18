// src/store/authStore.ts
import { create } from "zustand"
import { supabase } from "../lib/supabase"

interface AuthStore {
  user: any | null
  loading: boolean
  setUser: (user: any | null) => void
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  initSession: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) set({ user: data.user })
    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  initSession: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, loading: false })
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
  },
}))
