import { create } from "zustand"

type SettingsState = {
  showTimeRemaining: boolean
  showInRed: boolean
  showReservedRooms: boolean
  isOpen: boolean
  toggleShowTimeRemaining: (value?: boolean, fromRemote?: boolean) => void
  toggleShowInRed: (value?: boolean, fromRemote?: boolean) => void
  toggleShowReservedRooms: (value?: boolean, fromRemote?: boolean) => void
  toggleOpen: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showTimeRemaining: true,
  showInRed: false,
  showReservedRooms: true,
  isOpen: false,

  toggleShowTimeRemaining: (value) =>
    set((state) => ({
      showTimeRemaining: value ?? !state.showTimeRemaining,
    })),

  toggleShowInRed: (value) =>
    set((state) => ({
      showInRed: value ?? !state.showInRed,
    })),

  toggleShowReservedRooms: (value) =>
    set((state) => ({
      showReservedRooms: value ?? !state.showReservedRooms,
    })),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}))
