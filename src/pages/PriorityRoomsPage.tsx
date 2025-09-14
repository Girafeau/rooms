import { PriorityRooms } from "../components/PriorityRooms";
import { useRoomsStore } from "../store/useRoomsStore";

export default function PriorityRoomsPage() {

  const { rooms } = useRoomsStore()

  return <div>
    <PriorityRooms rooms={rooms} />
  </div>
}