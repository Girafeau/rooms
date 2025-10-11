import type { Teacher } from "./Teacher"
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
    is_restricted: boolean
  }

  export type Instrument = 
    | "Danse"
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

    export type Reserved = 
    | "Standard"
    | "Réservé"

    export const types: Type[] = ["Studio", "Salle"]
    export const statuses: number[] = [0, 1, 2, 3]
    export const reserved: Reserved[] = ["Standard"]

   export const statusLabels: Record<string, string> = {
  "0": "Occupé",
  "1": "Libre",
  "2": "Délogeable",
  "3": "Indisponible",
}


  export type RoomWithStatus = Room & { timeRemaining: number | null , status: number, lastUse?: Use | null, teachers: Teacher[], }
  