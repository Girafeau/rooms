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

const soon = [...soonlyKickableRooms].slice(0, 5)

    return (
        <div className="">
            <BarCodeListener priorityRooms={priority} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {priority.map((room, i) => (
                    <MinimalRoomCard key={room.id} room={room} index={i} />
                ))}

                {priority.length === 0 && (
                    <div>
                    <p className="text-sm">Il n'y a pour l'instant aucun studio de libre. C'est triste. Voici des petits canards pour te réconforter.</p>
                    <img
                    src="/canard.png"
                    alt="Logo"
                    className="object-contain"
                  />
                  </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {soon.map((room, i) => (
                    <MinimalRoomCard key={room.id} room={room} index={i} />
                ))}
            </div>
        </div>
    )
}
