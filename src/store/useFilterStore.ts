import { create } from "zustand"
// src/store/useFilterStore.ts
// ajoute "list" à la définition du sortMode
type SortMode = "floor" | "time" | "list"

type FilterStore = {
  filteredTypes: string[]
  filteredStatuses: number[]
  filteredReserved: string[]
  roomSearch: string
  nameSearch: string
  sortMode: SortMode
  toggleType: (type: string) => void
  toggleStatus: (status: number) => void
  toggleReserved: (reserved: string) => void
  setRoomSearch: (room: string) => void
  setNameSearch: (name: string) => void
  setSortMode: (mode: SortMode) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  filteredTypes: [],
  filteredStatuses: [],
  filteredReserved: [],
  roomSearch: "",
  nameSearch: "",
  sortMode: "floor",

  toggleType: (type) =>
    set((state) => ({
      filteredTypes: state.filteredTypes.includes(type)
        ? state.filteredTypes.filter((t) => t !== type)
        : [...state.filteredTypes, type],
    })),

  toggleStatus: (status) =>
    set((state) => ({
      filteredStatuses: state.filteredStatuses.includes(status)
        ? state.filteredStatuses.filter((s) => s !== status)
        : [...state.filteredStatuses, status],
    })),

    toggleReserved: (reserved) =>
    set((state) => ({
      filteredReserved: state.filteredReserved.includes(reserved)
        ? state.filteredReserved.filter((s) => s !== reserved)
        : [...state.filteredReserved, reserved],
    })),

  setRoomSearch: (room) => set({ roomSearch: room }),
  setNameSearch: (name) => set({ nameSearch: name }),
  setSortMode: (mode) => set({ sortMode: mode }),

  resetFilters: () =>
    set({
      filteredTypes: [],
      filteredStatuses: [],
      filteredReserved: [],
      roomSearch: "",
      nameSearch: "",
      sortMode: "floor",
    }),
}))
