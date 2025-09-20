import { RoomCard } from "../components/RoomCard"
import { RoomTypeFilter } from "../components/RoomTypeFilter"
import { useFilterStore } from "../store/useFilterStore"
import { useRoomsStore } from "../store/useRoomsStore"

export default function RoomsPage() {
  const { rooms } = useRoomsStore()
  const { filteredTypes } = useFilterStore()

  // Filtrage par types dans la page
  const filteredRooms = rooms.filter((r) => filteredTypes.includes(r.type))

  // Regrouper par étage pour l'affichage
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
                {floor > 0 ?
                  <div>
                    <h2 className="text-l font-semibold">
                      {floor}{floor === 1 ? " er".toLocaleUpperCase() : " ème".toLocaleUpperCase()}
                    </h2>
                    <p className="text-sm font-semibold">{"étage".toLocaleUpperCase()}</p>
                  </div> : floor < 0 ? <h2 className="text-l font-semibold">
                    {"sous-sol".toUpperCase()}
                  </h2> : <h2 className="text-l font-semibold">
                    {"rez-de-chaussée".toUpperCase()}
                  </h2>
                }
              </div>
            </div>
            {groupedByFloorFiltered[floor].sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0)).map((room) => (
              <RoomCard key={room.number} room={room} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}