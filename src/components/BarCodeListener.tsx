import { useEffect, useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { supabase } from "../lib/supabase"
import { Toast } from "./Toast"

type Props = {
  priorityRooms: RoomWithStatus[]
  defaultDuration?: number // durée par défaut en minutes
}

export function BarCodeListener({ priorityRooms, defaultDuration = 120 }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [buffer, setBuffer] = useState("")
  const [, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const showToast = (personName: string, roomNumber: string) => {
    setToastMessage(`${personName} scanné à ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} et inscrit dans le studio ${roomNumber}.`)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!buffer) return
        const scannedText = buffer.toUpperCase()
        setBuffer("")
        setCodes((prev) => [...prev, scannedText])

        if (priorityRooms.length === 0) return
        const firstRoom = priorityRooms[0]
        setLoading(true)

        try {
          // Si la salle est délogeable, terminer l'ancienne utilisation
          if (firstRoom.status === 2 && firstRoom.lastUse) {
            const { error: exitError } = await supabase
              .from("uses")
              .update({ exit_time: new Date().toISOString() })
              .eq("id", firstRoom.lastUse.id)

            if (exitError) console.error("Erreur de sortie :", exitError)
          }

          // Ajouter la nouvelle utilisation
          const { error: insertError } = await supabase.from("uses").insert({
            room_number: firstRoom.number,
            user_full_name: scannedText,
            entry_time: new Date().toISOString(),
            max_duration: defaultDuration,
            exit_time: null
          })

          if (insertError) console.error("Erreur ajout :", insertError)

          if (!insertError) {
            showToast(scannedText, firstRoom.number)
          }

        } finally {
          setLoading(false)
        }

        clearTimeout(timer)
        return
      }

      setBuffer((prev) => prev + e.key)

      // vider le buffer si scan trop long
      clearTimeout(timer)
      timer = setTimeout(() => setBuffer(""), 100)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearTimeout(timer)
    }
  }, [buffer, priorityRooms, defaultDuration])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-grey border-dashed border-1 border-dark-grey flex flex-col">
        <p className="text-sm">Scannez une carte.</p>
        {loading && <p className="text-sm text-blue-500">Ajout en cours...</p>}
      </div>

      <div className="flex">
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </div>

  )
}
