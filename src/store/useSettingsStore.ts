import { create } from "zustand"

type SettingsState = {
  showScores: boolean
  toggleScores: () => void
  isOpen: boolean
  toggleOpen: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showScores: true,
  toggleScores: () => set((state) => ({ showScores: !state.showScores })),
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen }))
}))
