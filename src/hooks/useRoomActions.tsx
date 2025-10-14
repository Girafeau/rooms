// src/hooks/useRoomActions.ts
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { RoomWithStatus } from "../types/Room"
import { useScanStore } from "../store/useScanStore"

export function useRoomActions(room?: RoomWithStatus | null) {
  const { selectedScan } = useScanStore()
  const [loading, setLoading] = useState(false)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   useEffect(() => {
    if (!errorMessage) return
    const timer = setTimeout(() => setErrorMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [errorMessage])


  const checkAccessBans = async (userId: number) => {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("access_bans")
      .select("*")
      .eq("user_id", userId)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle()

    if (error) {
      console.error("Erreur checkAccessBans:", error)
      return { banned: false, reason: null, expires_at: null }
    }

    if (!data) {
      return { banned: false, reason: null, expires_at: null }
    }

    return {
      banned: true,
      reason: data.reason,
      expires_at: data.expires_at, // peut être null → ban à vie
    }
  }


  const checkAccessRights = async (userId: number, roomNumber: string) => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("access_rights")
      .select("*")
      .eq("user_id", userId)
      .eq("room_number", roomNumber)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle()

    if (error) {
      console.error(error)
      return false
    }
    return !!data
  }

  const handleSetUnavailable = async (replacing: boolean) => {
    if (!room) return
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    try {
      const { error } = await supabase.from("uses").insert({
        room_number: room.number,
        user_full_name: "Indisponibilité".toUpperCase(),
        entry_time: new Date().toISOString(),
        max_duration: 0,
        exit_time: null,
        status: 0,
      })
      if (error) console.error(error)
    } finally {
      setLoading(false)
      
    }
  }

  const handleAddUse = async (replacing: boolean) => {
    if (!room) return
    if (!selectedScan || !selectedScan.userFullName) {
      setErrorMessage("Personne n'a été scanné.")
      return
    }

    if (selectedScan.userId) {
      const { banned, reason, expires_at } = await checkAccessBans(Number(selectedScan.userId))
      if (banned) {
        setErrorMessage(
          `L'utilisateur est banni
                  ${expires_at
            ? " jusqu'au " + new Date(expires_at!).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
              .replace(",", "")
            : " à vie "}${reason ? " pour la raison suivante : " + reason + " »" : "."}`
        )
        return
      }
    }

    // ✅ Vérification des droits
    if (room.is_restricted) {
      if (selectedScan.userId) {
        const hasAccess = await checkAccessRights(Number(selectedScan.userId), room.number)
        if (!hasAccess) {
          setErrorMessage("L'utilisateur n'est pas autorisé.")
          return
        }
      } else {
        setErrorMessage("Les droits ne peuvent pas être vérifiés car l'utilisateur n'est pas connu.")
        return
      }
    }

    setErrorMessage(null)
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    const { error } = await supabase.from("uses").insert({
      room_number: room.number,
      user_full_name: selectedScan.userFullName,
      entry_time: new Date().toISOString(),
      max_duration: selectedScan.duration,
      exit_time: null,
    })

    if (!error) {
      
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  const handleExit = async () => {
    if (!room) return
    if (!room.lastUse) return
    setLoading(true)

    const { error } = await supabase
      .from("uses")
      .update({ exit_time: new Date().toISOString() })
      .eq("id", room.lastUse.id)

    if (error) console.error(error)
    setLoading(false)
  }

  const handleAddMoreDuration = async () => {
    if (!room) return
  if (!room.lastUse) return
  setLoading(true)

  try {
    const entryTime = new Date(room.lastUse.entry_time)
    const now = new Date()
    const elapsedMs = now.getTime() - entryTime.getTime()
    const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60)

    // ⏱️ nouveau max_duration = temps écoulé + 120 minutes restantes
    const newMaxDuration = elapsedMinutes + 120

    const { error } = await supabase
      .from("uses")
      .update({ max_duration: newMaxDuration })
      .eq("id", room.lastUse.id)

    if (error) console.error(error)
  } catch (e) {
    console.error(e)
  } finally {
    setLoading(false)
  }
}

  const handleAddTeacher = async (replacing: boolean, full_name: string) => {
    if (!room) return
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    const { error } = await supabase.from("uses").insert({
      room_number: room.number,
      user_full_name: full_name,
      entry_time: new Date().toISOString(),
      max_duration: 0,
      exit_time: null,
    })

    if (!error) {
     
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  return {
    handleAddUse,
    handleAddTeacher,
    handleExit,
    handleSetUnavailable,
    handleAddMoreDuration,
    loading,
    errorMessage
  }
}
