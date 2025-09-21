import { create } from "zustand"

interface FilterState {
  filteredTypes: string[]
  filteredRoomsNumber: string[]
  filteredStatuses: number[]
  sortMode: "floor" | "time"
  setSortMode: (mode: "floor" | "time") => void
  toggleType: (type: string) => void
  toggleNumber: (number: string) => void
  toggleStatus: (status: number) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  filteredTypes: [],
  filteredRoomsNumber: [],
  filteredStatuses: [],
  sortMode: "floor", // valeur par défaut

  setSortMode: (mode) => set({ sortMode: mode }),

  toggleType: (type) =>
    set((state) => ({
      filteredTypes: state.filteredTypes.includes(type)
        ? state.filteredTypes.filter((t) => t !== type)
        : [...state.filteredTypes, type],
    })),

  toggleNumber: (number) =>
    set((state) => ({
      filteredRoomsNumber: state.filteredRoomsNumber.includes(number)
        ? state.filteredRoomsNumber.filter((n) => n !== number)
        : [...state.filteredRoomsNumber, number],
    })),

  toggleStatus: (status) =>
    set((state) => ({
      filteredStatuses: state.filteredStatuses.includes(status)
        ? state.filteredStatuses.filter((s) => s !== status)
        : [...state.filteredStatuses, status],
    })),
}))
