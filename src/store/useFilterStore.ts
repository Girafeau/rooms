import { create } from "zustand"
type SortMode = "floor" | "time"

type FilterStore = {
  filteredTypes: string[]
  filteredStatuses: number[]
  roomSearch: string
  nameSearch: string
  sortMode: SortMode
  toggleType: (type: string) => void
  toggleStatus: (status: number) => void
  setRoomSearch: (room: string) => void
  setNameSearch: (name: string) => void
  setSortMode: (mode: SortMode) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  filteredTypes: [],
  filteredStatuses: [],
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

  setRoomSearch: (room) => set({ roomSearch: room }),
  setNameSearch: (name) => set({ nameSearch: name }),
  setSortMode: (mode) => set({ sortMode: mode }),

  resetFilters: () =>
    set({
      filteredTypes: [],
      filteredStatuses: [],
      roomSearch: "",
      nameSearch: "",
      sortMode: "floor",
    }),
}))
