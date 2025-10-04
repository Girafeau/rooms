import { create } from "zustand"

type SettingsState = {
  showScores: boolean
  toggleScores: () => void
  isOpen: boolean
  toggleOpen: () => void
  showTimeRemaining: boolean
  toggleTimeRemaining: () => void
  showInRed: boolean
  toggleInRed: () => void
  showReservedRooms: boolean
  toggleReservedRooms: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showScores: true,
  toggleScores: () => set((state) => ({ showScores: !state.showScores })),
  showTimeRemaining: true,
  toggleTimeRemaining: () => set((state) => ({ showTimeRemaining: !state.showTimeRemaining })),
  showInRed: true,
  toggleInRed: () => set((state) => ({ showInRed: !state.showInRed })),
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  showReservedRooms: false,
  toggleReservedRooms: () => set((state) => ({ showReservedRooms: !state.showReservedRooms }))
}))
