import { create } from "zustand"
import { types, type Type } from "../types/Room"

interface FilterStore {
  filteredTypes: Type[]
  toggleType: (type: Type) => void
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filteredTypes: [...types],
  toggleType: (type: Type) => {
    const { filteredTypes } = get()
    if (filteredTypes.includes(type)) {
      set({ filteredTypes: filteredTypes.filter((t) => t !== type) })
    } else {
      set({ filteredTypes: [...filteredTypes, type] })
    }
  }
}))
