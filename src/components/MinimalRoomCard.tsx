import type { RoomWithStatus } from "../types/Room"
import formatHHMM from "../utils/format"

type Props = {

  room: RoomWithStatus,
  index: number
}

export function formatEndTime(entry_time: string, max_duration: number): string {
    const entry = new Date(entry_time)
    const endTime = new Date(entry.getTime() + max_duration * 60 * 1000)
  
    return endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  
const colors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green",
    0: "bg-red",
    2: "bg-orange"
}

const lightColors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green-light",
    0: "bg-red-light",
    2: "bg-orange-light"
}

export function MinimalRoomCard({ room }: Props) {
  return (
    <div className="flex flex-col gap-2">

    <div className={`p-4 ${colors[room.status]} flex flex-col transition h-full`}>
       
    <h3 className="text-lg font-bold">{room.number}</h3>
    {room.status === 1 && (
        <p className="text-sm"></p>
      )}
      {room.status === 2 && room.lastUse &&(
        <p className="text-sm">{formatHHMM(room.timeRemaining)}</p>
      )}
       {room.status === 0 && (
        <p className="text-sm">{formatHHMM(room.timeRemaining)}</p>
      )}
    </div>
    {room.description && (
       <div className={`p-4 text-sm ${lightColors[room.status]}`}>{room.description}</div>
      )}
    
    </div>
  )
}
