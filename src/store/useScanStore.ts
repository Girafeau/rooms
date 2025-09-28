import { create } from "zustand"

export type Scan = {
  id: string
  code: string
  timestamp: string
  userFullName: string | null
  userId: number | null
  duration: number | null
}

type ScanStore = {
  scans: Scan[]
  selectedScan: Scan | null
  addScan: (scan: Scan) => void
  updateScan: (id: string, data: Partial<Scan>) => void
  setSelectedScan: (id: string | null) => void
  removeScan: (id: string) => void
  reset: () => void
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scans: [],
  selectedScan: null,

  addScan: (scan) =>
    set((state) => ({
      scans: [scan, ...state.scans], // ajoute en haut de la liste
      selectedScan: scan,
    })),

  updateScan: (id, data) =>
    set((state) => ({
      scans: state.scans.map((scan) =>
        scan.id === id ? { ...scan, ...data } : scan
      ),
      selectedScan:
        state.selectedScan?.id === id
          ? { ...state.selectedScan, ...data }
          : state.selectedScan,
    })),

  setSelectedScan: (id) => {
    if (!id) {
      set({ selectedScan: null })
      return
    }
    const scan = get().scans.find((s) => s.id === id) || null
    set({ selectedScan: scan })
  },

  removeScan: (id) =>
    set((state) => ({
      scans: state.scans.filter((scan) => scan.id !== id),
      selectedScan:
        state.selectedScan?.id === id ? null : state.selectedScan,
    })),

  reset: () => set({ scans: [], selectedScan: null }),
}))
