import type { Use } from "./Use"

export type Room = {
    number: string
    score: number
    floor: number
    description: string
    hidden_description: string | null
    reserved: Instrument | null
    type: Type
    name: string | null
  }

  export type Instrument = 
    | "Jazz"
    | "Guitare"
    | "Piano"
    | "Harpe"
    | "Contrebasse"
    | "Orgue";

    export type Type = 
    | "Studio"
    | "Salle"
    | "Salle de concert";

    export const types: Type[] = ["Studio", "Salle"]


  export type RoomWithStatus = Room & { timeRemaining: number | null  ,status: number, lastUse?: Use | null }
  