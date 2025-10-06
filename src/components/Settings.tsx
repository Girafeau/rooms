import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useSettingsStore } from "../store/useSettingsStore"
import { useAuthStore } from "../store/authStore"
import { IconCheckbox } from "./IconCheckbox"

export function Settings() {
  const {
    showTimeRemaining,
    toggleShowTimeRemaining,
    showInRed,
    toggleShowInRed,
    showReservedRooms,
    toggleShowReservedRooms
  } = useSettingsStore()

  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  // 🟢 Charger les paramètres depuis Supabase
  

  // 🟣 Écouter les mises à jour temps réel (Supabase Realtime)
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`settings_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any
          if (newData) {
            toggleShowTimeRemaining(newData.show_time_remaining, true)
            toggleShowInRed(newData.show_in_red, true)
            toggleShowReservedRooms(newData.show_reserved_rooms, true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // 🧠 Sauvegarde sur Supabase
  const saveSetting = async (
    key: "show_time_remaining" | "show_in_red" | "show_reserved_rooms",
    value: boolean
  ) => {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from("settings").upsert({
      user_id: user.id,
      [key]: value,
    },
   { onConflict: "user_id" })
    setLoading(false)
    if (error) console.error("Erreur de sauvegarde du paramètre :", error)
  }

  return (
    <div>
    
      {/* Panneau de configuration */}
      {true && (
        <div className="p-4 flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2">Paramètres d’affichage</h3>

          <div className="flex flex-col gap-3">
            <IconCheckbox
              label="Masquer les temps restants"
              checked={showTimeRemaining}
              onChange={() => {
                toggleShowTimeRemaining(!showTimeRemaining)
                saveSetting("show_time_remaining", !showTimeRemaining)
              }}
              disabled={loading}
            />
            <IconCheckbox
              label="Différencier l'affichage occupé/délogeable"
              checked={showInRed}
              onChange={() => {
                toggleShowInRed(!showInRed)
                saveSetting("show_in_red", !showInRed)
              }}
              disabled={loading}
            />
            <IconCheckbox
              label="Masquer les studios réservés"
              checked={showReservedRooms}
              onChange={() => {
                toggleShowReservedRooms(!showReservedRooms)
                saveSetting("show_reserved_rooms", !showReservedRooms)
              }}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
