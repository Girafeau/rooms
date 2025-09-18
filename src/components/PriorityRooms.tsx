import type { RoomWithStatus } from "../types/Room"
import { BarCodeListener } from "./BarCodeListener"
import { MinimalRoomCard } from "./MinimalRoomCard"

type Props = {
    rooms: RoomWithStatus[]
}

export function PriorityRooms({ rooms }: Props) {
    // 1. salles libres triées par meilleur score
    const isReservedStrict = false;
    const freeRooms = rooms
        .filter((r) => r.status === 1 && (!r.reserved || !isReservedStrict))
        .sort((a, b) => b.score - a.score)

    // 2. salles délogeables triées par entrée la plus ancienne
    const kickableRooms = rooms
        .filter((r) => r.status === 2 && r.lastUse && (!r.reserved || !isReservedStrict))
        .sort(
            (a, b) =>
                new Date(a.lastUse!.entry_time).getTime() -
                new Date(b.lastUse!.entry_time).getTime()
        )

    // 3. concaténer puis prendre les 5 premières
    const priority = [...freeRooms, ...kickableRooms]

    const soonlyKickableRooms = rooms
        .filter((r) => r.status === 0 && r.lastUse && (!r.reserved || !isReservedStrict))
        .sort(
            (a, b) =>
                new Date(a.lastUse!.entry_time).getTime() -
                new Date(b.lastUse!.entry_time).getTime()
)   

const soon = [...soonlyKickableRooms]

    return (
        <div className="flex flex-col gap-4">
            <BarCodeListener priorityRooms={priority} />
            <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
                {priority.map((room, i) => (
                    <MinimalRoomCard key={room.id} room={room} index={i} />
                ))}

                {priority.length === 0 && (
                    <div>
                   
                  </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {soon.map((room, i) => (
                    <MinimalRoomCard key={room.id} room={room} index={i} />
                ))}
            </div>
            </div>
        </div>
    )
}
