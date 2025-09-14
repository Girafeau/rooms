import { create } from "zustand"
import { supabase } from "../lib/supabase"
import type { RoomWithStatus } from "../types/Room"
import type { Use } from "../types/Use"

interface RoomsStore {
  rooms: RoomWithStatus[]
  groupedByFloor: Record<number, RoomWithStatus[]>
  fetchRooms: () => Promise<void>
  subscribeRealtime: () => void
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

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  rooms: [],
  groupedByFloor: {},
  fetchRooms: async () => {
    const { data: roomsData } = await supabase.from("rooms").select("*")
    const { data: lastUses } = await supabase.from("last_uses").select("*")
    if (!roomsData) return

    const usesByRoom: Record<number, Use> = {};
    (lastUses ?? []).forEach((u) => {
      if (u && typeof u.room_id === "number") usesByRoom[u.room_id] = u
    })

    const now = new Date()
    const withStatus: RoomWithStatus[] = roomsData.map((room) => {
      const lastUse = usesByRoom[room.id] ?? null
      const status = computeRoomStatus(lastUse, now)
      const timeRemaining = computeTimeRemaining(lastUse)
      return { ...room, status, lastUse, timeRemaining }
    })

    const groupedByFloor = withStatus.reduce<Record<number, RoomWithStatus[]>>((acc, room) => {
      if (!acc[room.floor]) acc[room.floor] = []
      acc[room.floor].push(room)
      return acc
    }, {})

    set({ rooms: withStatus, groupedByFloor })
  },
  subscribeRealtime: () => {
    supabase
      .channel("room-uses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "uses" },
        () => get().fetchRooms()
      )
      .subscribe()

    // Ticking : met à jour timeRemaining chaque seconde
    setInterval(() => {
      set((state) => {
        const updatedRooms = state.rooms.map((room) => {
          if (!room.lastUse || room.status === 1) return room
          const timeRemaining = computeTimeRemaining(room.lastUse)
          let status = room.status
          if (timeRemaining !== null && timeRemaining <= 0 && status !== 2) status = 2
          return { ...room, timeRemaining, status }
        })
        const groupedByFloor = updatedRooms.reduce<Record<number, RoomWithStatus[]>>((acc, room) => {
          if (!acc[room.floor]) acc[room.floor] = []
          acc[room.floor].push(room)
          return acc
        }, {})
        return { rooms: updatedRooms, groupedByFloor }
      })
    }, 1000)
  }
}))

// Auto-init store
useRoomsStore.getState().fetchRooms()
useRoomsStore.getState().subscribeRealtime()
