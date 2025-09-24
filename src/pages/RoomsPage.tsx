import BarCodeListener from "../components/BarCodeListener"
import { RoomCard } from "../components/RoomCard"
import { RoomTypeFilter } from "../components/RoomTypeFilter"
import { useFilterStore } from "../store/useFilterStore"
import { useRoomsStore } from "../store/useRoomsStore"

export default function RoomsPage() {
  const { rooms } = useRoomsStore()
  const { filteredTypes, filteredRoomsNumber, filteredStatuses, sortMode } = useFilterStore()

  // Filtrage par types
  let filteredRooms = rooms
  if (filteredTypes.length > 0) {
    filteredRooms = filteredRooms.filter((r) => filteredTypes.includes(r.type))
  }
  if (filteredRoomsNumber.length > 0) {
    filteredRooms = filteredRooms.filter((r) => filteredRoomsNumber.includes(r.number))
  }
  if (filteredStatuses.length > 0) {
    filteredRooms = filteredRooms.filter((r) => filteredStatuses.includes(r.status))
  }

  // 🟦 Mode affichage par étage
  if (sortMode === "floor") {
    const groupedByFloorFiltered = filteredRooms.reduce<Record<number, typeof filteredRooms>>(
      (acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = []
        acc[room.floor].push(room)
        return acc
      },
      {}
    )

    const sortedFloors = Object.keys(groupedByFloorFiltered)
      .map(Number)
      .sort((a, b) => b - a)

    return (
      <div className="flex flex-col gap-4 p-4">
        <RoomTypeFilter />
        {sortedFloors.map((floor) => (
          <div key={floor}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center text-sm">
                <div className="p-4 flex flex-col items-center h-full justify-center bg-grey">
                  {floor > 0 ? (
                    <div>
                      <h2 className="text-l font-semibold">
                        {floor}{floor === 1 ? " er".toUpperCase() : " ème".toUpperCase()}
                      </h2>
                      <p className="text-sm font-semibold">{"étage".toUpperCase()}</p>
                    </div>
                  ) : floor < 0 ? (
                    <h2 className="text-l font-semibold">{"sous-sol".toUpperCase()}</h2>
                  ) : (
                    <h2 className="text-l font-semibold">{"rez-de-chaussée".toUpperCase()}</h2>
                  )}
                </div>
              </div>
              {groupedByFloorFiltered[floor]
                .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0))
                .map((room) => (
                  <RoomCard key={room.number} room={room} />
                ))}
            </div>
          </div>
        ))}
        <BarCodeListener />
      </div>
    )
  }

  if (sortMode === "time") {
  const sortedByTime = [...filteredRooms].sort((a, b) => {
    const aLast = a.lastUse
    const bLast = b.lastUse

    // 1️⃣ Aucun lastUse ou exit_time défini → trier par numéro
    if ((!aLast || aLast.exit_time) && (!bLast || bLast.exit_time)) {
      return Number(a.number) - Number(b.number)
    }
    if (!aLast || aLast.exit_time) return -1
    if (!bLast || bLast.exit_time) return 1

    // 2️⃣ max_duration = 0 → priorité basse mais trier par numéro
    if (aLast.max_duration === 0 && bLast.max_duration === 0) {
      return Number(a.number) - Number(b.number)
    }
    if (aLast.max_duration === 0) return 1
    if (bLast.max_duration === 0) return -1

    // 3️⃣ temps restant
    const aEnd = new Date(aLast.entry_time).getTime() + aLast.max_duration * 60000
    const bEnd = new Date(bLast.entry_time).getTime() + bLast.max_duration * 60000
    return aEnd - bEnd
  })


    return (
      <div className="flex flex-col gap-4 p-4">
        <RoomTypeFilter />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {sortedByTime.map((room) => (
            <RoomCard key={room.number} room={room} />
          ))}
        </div>
        <BarCodeListener />
      </div>
    )
  }
  return null
}
