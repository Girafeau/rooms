import { RoomCardDisplay } from "../components/RoomCardDisplay"
import { useRoomsStore } from "../store/useRoomsStore"
import { useSettingsStore } from "../store/useSettingsStore"

export default function DisplayPage() {
  const { rooms } = useRoomsStore()
  const { showReservedRooms } = useSettingsStore()

  // Filtrage par types dans la page
  const filteredRooms = rooms.filter((r) => r.type === "Studio").filter((r) =>
    !r.reserved || showReservedRooms
  )

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

      {/* Encadré Studios */}


      {sortedFloors.map((floor) => (
        <div key={floor}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
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

              <RoomCardDisplay key={room.number} room={room} />

            ))}
          </div>

        </div>
      ))}
      
    </div>
  )
}