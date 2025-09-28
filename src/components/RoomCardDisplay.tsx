import type { RoomWithStatus } from "../types/Room"
import formatHHMM from "../utils/format"


type Props = {
    room: RoomWithStatus
}

const colors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green",
    0: "bg-red",
    2: "bg-orange"
}

const darkColors: Record<RoomWithStatus["status"], string> = {
    1: "text-green-dark",
    0: "text-red-dark",
    2: "text-orange-dark"
}

const lightColors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green-light",
    0: "bg-red-light",
    2: "bg-orange-light"
}

export function RoomCardDisplay({ room }: Props) {
   console.log(room);
   
    return (
        <div className="flex flex-col">
            <div className={`p-4 flex flex-col transition ${colors[room.status]}`}>
                 <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold mr-4`}>{room.number}</h3>

                    <span className={`text-sm font-semibold truncate cursor-default ${darkColors[room.status]}`}>{room.reserved?.toUpperCase()}</span>

                </div>

                
            </div>
           

            {(room.status === 0 || room.status === 2) && room.lastUse && (
                <div className="flex flex-col">
                    <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
                        <div className="flex justify-between">
                            <p>
                                {new Date(room.lastUse.entry_time).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }).replace(",", "")}
                            </p>
                             {room.timeRemaining && room.lastUse.max_duration > 0 && <p>{formatHHMM(room.timeRemaining)}</p>}
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
