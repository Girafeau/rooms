// src/store/useScanNotificationStore.ts
import { create } from "zustand"

type ScanNotificationStore = {
  newScanCount: number
  increment: () => void
  reset: () => void
}

export const useScanNotificationStore = create<ScanNotificationStore>((set) => ({
  newScanCount: 0,
  increment: () => set((state) => ({ newScanCount: state.newScanCount + 1 })),
  reset: () => set({ newScanCount: 0 }),
}))
