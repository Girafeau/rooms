import type { Use } from "./Use"

export type Room = {
    id: number
    number: number
    score: number
    floor: number
    description: string
    hidden_description: string
    reserved: Instrument | null
  }

  export type Instrument = 
    | "Guitare"
    | "Piano"
    | "Harpe"
    | "Contrebasse"
    | "Orgue";

  export type RoomWithStatus = Room & { timeRemaining: number | null  ,status: number, lastUse?: Use | null }
  