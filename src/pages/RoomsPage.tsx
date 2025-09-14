import { RoomCard } from "../components/RoomCard"
import { useRoomsStore } from "../store/useRoomsStore"


export default function RoomsPage() {
  const { groupedByFloor } = useRoomsStore()


  // Trier les étages du plus grand au plus petit
  const sortedFloors = Object.keys(groupedByFloor)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-4">
      {sortedFloors.map((floor) => (
        <div key={floor}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center text-sm">
            <div className="flex flex-col items-center h-full justify-center bg-grey">
          <h2 className="text-l font-semibold">
            {floor}{floor === 1 ? " er".toLocaleUpperCase() : " ème".toLocaleUpperCase()}
          </h2>
          <p className="text-sm font-semibold">{"étage".toLocaleUpperCase()}</p>
          </div>
          </div>
            {groupedByFloor[floor].sort((a, b) => a.number - b.number).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          
        </div>
      ))}
    </div>
  )
}