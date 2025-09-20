import { create } from "zustand"
import { supabase } from "../lib/supabase"
import type { RoomWithStatus } from "../types/Room"
import type { Use } from "../types/Use"

interface RoomsStore {
  rooms: RoomWithStatus[]
  fetchRooms: () => Promise<void>
  subscribeRealtime: () => void
  stopRealtime: () => void
}

function computeRoomStatus(use: Use | null, now: Date = new Date()): number {
  if (!use || !use.entry_time) return 1 // libre
  const entry = new Date(use.entry_time)
  const endTime = new Date(entry.getTime() + (use.max_duration ?? 0) * 60 * 1000)

  if (use.exit_time && new Date(use.exit_time) < now) return 1
  if (now >= endTime && !use.exit_time) return 2 // délogeable
  if (now < endTime && !use.exit_time) return 0 // occupée
  return 1
}

function computeTimeRemaining(use: Use | null): number | null {
  if (!use || !use.entry_time || use.exit_time) return null
  const entry = new Date(use.entry_time)
  return entry.getTime() + (use.max_duration ?? 0) * 60_000 - Date.now()
}

let tickTimer: NodeJS.Timeout | null = null
let supabaseChannel: ReturnType<typeof supabase.channel> | null = null

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  rooms: [],
  groupedByFloor: {},

  fetchRooms: async () => {
    const { data: roomsData } = await supabase.from("rooms").select("*")
    const { data: lastUses } = await supabase.from("last_uses").select("*")
    if (!roomsData) return

    const usesByRoom: Record<number, Use> = {}
    ;(lastUses ?? []).forEach((u) => {
      if (u) usesByRoom[u.room_number] = u
    })

    const now = new Date()
    const withStatus: RoomWithStatus[] = roomsData.map((room) => {
      const lastUse = usesByRoom[room.number] ?? null
      const status = computeRoomStatus(lastUse, now)
      const timeRemaining = computeTimeRemaining(lastUse)
      return { ...room, status, lastUse, timeRemaining }
    })

    set({ rooms: withStatus })
  },

  subscribeRealtime: () => {
    // éviter plusieurs abonnements
    if (supabaseChannel) return

    // Abonnement Supabase
    supabaseChannel = supabase
      .channel("room-uses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "uses" }, () => {
        get().fetchRooms()
      })
      .subscribe()

    // Ticking toutes les secondes
    if (!tickTimer) {
      tickTimer = setInterval(() => {
        set((state) => {
          const updatedRooms = state.rooms.map((room) => {
            if (!room.lastUse || room.status === 1) return room

            const timeRemaining = computeTimeRemaining(room.lastUse)
            let status = room.status

            // si expiré => délogeable
            if (
              timeRemaining !== null &&
              timeRemaining <= 0 &&
              status !== 2 &&
              !room.lastUse.kickable_activation_time
            ) {
              status = 2
              supabase
                .from("uses")
                .update({ kickable_activation_time: new Date().toISOString() })
                .eq("id", room.lastUse.id)
                .then(({ error }) => {
                  if (error) console.error("Erreur mise à jour kickable_activation_time :", error)
                })
            }

            return { ...room, timeRemaining, status }
          })

          return { rooms: updatedRooms }
        })
      }, 1000)
    }
  },

  stopRealtime: () => {
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel)
      supabaseChannel = null
    }
    if (tickTimer) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  },
}))


// Auto-init store
useRoomsStore.getState().fetchRooms()
useRoomsStore.getState().subscribeRealtime()