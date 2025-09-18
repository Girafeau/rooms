import { PriorityRooms } from "../components/PriorityRooms";
import { useRoomsStore } from "../store/useRoomsStore";

export default function PriorityRoomsPage() {

  const { rooms } = useRoomsStore()
  const studios = rooms.filter((room) => room.type === "Studio");

  return <div className="p-4">
    <PriorityRooms rooms={studios} />
  </div>
}