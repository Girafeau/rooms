import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useSettingsStore } from "../store/useSettingsStore"
import { useAuthStore } from "../store/authStore"
import { IconCheckbox } from "./IconCheckbox"
import ImportUsesFromCsv from "./ImportUseFromCsv"

export function Settings() {
  const {
    showTimeRemaining,
    setShowInRed,
    showInRed,
    setShowTimeRemaining,
    showReservedRooms,
    setShowReservedRooms
  } = useSettingsStore()

  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
 

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
        <div className="flex flex-col gap-4">
          <h3>Paramètres </h3>

          <div className="flex flex-col gap-2">
            <IconCheckbox
              label="Masquer les temps restants"
              checked={!showTimeRemaining}
              onChange={() => {
                setShowTimeRemaining(!showTimeRemaining)
                saveSetting("show_time_remaining", !showTimeRemaining)
              }}
              disabled={loading}
            />
            <IconCheckbox
              label="Différencier l'affichage occupé/délogeable"
              checked={!showInRed}
              onChange={() => {
                setShowInRed(!showInRed)
                saveSetting("show_in_red", !showInRed)
              }}
              disabled={loading}
            />
            <IconCheckbox
              label="Masquer les studios réservés"
              checked={!showReservedRooms}
              onChange={() => {
                setShowReservedRooms(!showReservedRooms)
                saveSetting("show_reserved_rooms", !showReservedRooms)
              }}
              disabled={loading}
            />
          </div>
          <ImportUsesFromCsv />
        </div>
      )}
    </div>
  )
}
