import { create } from "zustand"
import { supabase } from "../lib/supabase"

type SettingsState = {
  showTimeRemaining: boolean
  showInRed: boolean
  showReservedRooms: boolean
  userSettingsUserId: string | null
  initialized: boolean

  // setters locaux
  setShowTimeRemaining: (value: boolean) => void
  setShowInRed: (value: boolean) => void
  setShowReservedRooms: (value: boolean) => void

  // gestion des settings supabase
  loadUserSettings: (userId: string) => Promise<void>
  updateUserSetting: (key: "show_time_remaining" | "show_in_red" | "show_reserved_rooms", value: boolean) => Promise<void>
}

/**
 * 🧠 Store Zustand + Supabase realtime
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  showTimeRemaining: true,
  showInRed: false,
  showReservedRooms: true,
  userSettingsUserId: null,
  initialized: false,

  setShowTimeRemaining: (value) => {
    set({ showTimeRemaining: value })
   
  },

  setShowInRed: (value) => {
    set({ showInRed: value })
  },

  setShowReservedRooms: (value) => {
    set({ showReservedRooms: value })
  },

  /**
   * 🔁 Charge les paramètres utilisateur depuis Supabase
   */
  loadUserSettings: async (userId) => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (!error && data) {
      set({
        showTimeRemaining: data.show_time_remaining ?? true,
        showInRed: data.show_in_red ?? false,
        showReservedRooms: data.show_reserved_rooms ?? true,
        userSettingsUserId: userId,
        initialized: true,
      })
    } else {
      // s’il n’a pas encore de paramètres, on crée une ligne par défaut
      await supabase.from("settings").upsert({
        user_id: userId,
        show_time_remaining: true,
        show_in_red: false,
        show_reserved_rooms: true,
      })
      set({
        showTimeRemaining: true,
        showInRed: false,
        showReservedRooms: true,
        userSettingsUserId: userId,
        initialized: true,
      })
    }

    // écoute realtime
    supabase
      .channel("settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newData = payload.new as any
          if (newData) {
            set({
              showTimeRemaining: newData.show_time_remaining,
              showInRed: newData.show_in_red,
              showReservedRooms: newData.show_reserved_rooms,
            })
          }
        }
      )
      .subscribe()
  },

  /**
   * 💾 Met à jour la base de données Supabase
   */
  updateUserSetting: async (key, value) => {
    const userId = get().userSettingsUserId
    if (!userId) return

    const { error } = await supabase
      .from("settings")
      .upsert(
        { user_id: userId, [key]: value },
        { onConflict: "user_id" } // ✅ évite le doublon, update si existe
      )

    if (error) console.error("Erreur updateUserSetting:", error)
  },
}))
