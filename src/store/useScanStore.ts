// src/store/useScanStore.ts
import { create } from "zustand"

export type Scan = {
  id: string
  code: string
  timestamp: string
  userFullName?: string | null
  userId?: string | null
  duration?: number | null
}

interface ScanStore {
  scans: Scan[]
  selectedScan: Scan | null
  addScan: (scan: Scan) => void
  updateScan: (id: string, patch: Partial<Scan>) => void
  setSelectedScan: (id: string | null) => void
  clearScans: () => void
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scans: [],
  selectedScan: null,
  addScan: (scan) =>
    set((state) => ({
      scans: [scan, ...state.scans].slice(0, 100),
      selectedScan: scan, // le dernier devient sélectionné
    })),
  updateScan: (id, patch) =>
    set((state) => {
      const updated = state.scans.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      )
      const sel =
        state.selectedScan?.id === id
          ? { ...state.selectedScan, ...patch }
          : state.selectedScan
      return { scans: updated, selectedScan: sel }
    }),
  setSelectedScan: (id) => {
    if (!id) return set({ selectedScan: null })
    const scan = get().scans.find((s) => s.id === id) || null
    set({ selectedScan: scan })
  },
  clearScans: () => set({ scans: [], selectedScan: null }),
}))
