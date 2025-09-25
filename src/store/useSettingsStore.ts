import { create } from "zustand"

type SettingsState = {
  showScores: boolean
  toggleScores: () => void
  showVoiceAssitant: boolean
  toggleVoiceAssitant: () => void
  isOpen: boolean
  toggleOpen: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showScores: true,
  toggleScores: () => set((state) => ({ showScores: !state.showScores })),
  showVoiceAssitant: false,
  toggleVoiceAssitant: () => set((state) => ({ showVoiceAssitant: !state.showVoiceAssitant })),
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen }))
}))
