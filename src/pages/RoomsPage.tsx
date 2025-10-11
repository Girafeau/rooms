import { ListFilterPlus, ScanBarcode } from "lucide-react"
import { RoomCard } from "../components/RoomCard"
import { RoomTypeFilter } from "../components/RoomTypeFilter"
import { Title } from "../components/Title"
import { useFilterStore } from "../store/useFilterStore"
import { useRoomsStore } from "../store/useRoomsStore"
import { buttonBase } from "../App"
import { useEffect, useRef, useState } from "react"
import { ScanHistoryPanel } from "../components/ScanHistoryPanel"
import { useScanStore } from "../store/useScanStore"
import { useScanNotificationStore } from "../store/useScanNotificationStore"
import type { RoomWithStatus } from "../types/Room"
import formatHHMM from "../utils/format"

const colors: Record<RoomWithStatus["status"], string> = {
  1: "bg-green",
  0: "bg-red",
  2: "bg-orange",
}

export default function RoomsPage() {
  const { rooms } = useRoomsStore()
  const { scans } = useScanStore()
  const { filteredTypes, roomSearch, nameSearch, filteredStatuses, sortMode, filteredReserved } = useFilterStore()
  const [filtersVisible, setFiltersVisible] = useState(true) // 👈 filtres visibles par défaut
  const [scanPanelOpen, setScanPanelOpen] = useState(false)
  const { newScanCount, increment, reset } = useScanNotificationStore()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "number",
    direction: "asc",
  })
  const lastScanCountRef = useRef(scans.length)

  useEffect(() => {
    if (!scanPanelOpen && scans.length > lastScanCountRef.current) {
      increment()
    }
    lastScanCountRef.current = scans.length
  }, [scans.length])

  const openScanPanel = () => {
    setScanPanelOpen(true)
    reset()
  }

  const closeScanPanel = () => {
    setScanPanelOpen(false)
  }
  // --- Filtrage ---
  let filteredRooms = rooms
  if (filteredTypes.length > 0) {
    filteredRooms = filteredRooms.filter((r) => filteredTypes.includes(r.type))
  }
  if (filteredStatuses.length > 0) {
    filteredRooms = filteredRooms.filter((r) => filteredStatuses.includes(r.status))
  }

 if (filteredReserved.length > 0) {
    filteredRooms = filteredRooms.filter((r) => !r.reserved)
  }
  if (roomSearch.trim() !== "") {
    filteredRooms = filteredRooms.filter((r) =>
      r.number.toLowerCase().includes(roomSearch.toLowerCase())
    )
  }
  if (nameSearch.trim() !== "") {
    filteredRooms = filteredRooms.filter((r) => {
      const lastUseUser = (!r.lastUse?.exit_time && r.lastUse?.user_full_name) || ""
      return lastUseUser.toLowerCase().includes(nameSearch.toLowerCase())
    })
  }

  // --- Boutons communs ---
  const ActionButtons = (
    <div className="flex items-center gap-2">

       <button
        onClick={() => setFiltersVisible((prev) => !prev)}
        className={`${buttonBase} !p-4 !w-auto  ${filtersVisible ? "!bg-black text-white" : "bg-white hover:bg-grey"}`}
      >
        <ListFilterPlus className={`w-5 h-5 stroke-1`} />
      </button>

      <div className="relative">
        <button
          onClick={openScanPanel}
          className={`${buttonBase} !p-4 !w-auto bg-white hover:bg-grey relative`}
        >
          <ScanBarcode className="w-5 h-5 stroke-1" />
          {newScanCount > 0 && (
            <span className="absolute -top-1 -left-1 w-6 h-6 px-1 flex items-center justify-center bg-red-light text-red text-xs rounded-full">
              {newScanCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )

  // --- Affichage par étage ---
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
      <div className="flex flex-col gap-4 px-4">
        <Title back={true} title="" button={ActionButtons} />
        
        {filtersVisible && <RoomTypeFilter />}
        <ScanHistoryPanel open={scanPanelOpen} onClose={closeScanPanel} />
        <div className="flex flex-col gap-4">
          {sortedFloors.map((floor) => (
            <div key={floor}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center text-sm">
                  <div className="p-4 flex flex-col items-center h-full justify-center bg-grey striped-background">
                    {floor > 0 ? (
                      <div>
                        <h2 className="text-l font-semibold">
                          {floor}
                          {floor === 1 ? " er".toUpperCase() : " ème".toUpperCase()}
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

        </div>
      </div>
    )
  }

  // --- Affichage par temps ---
  if (sortMode === "time") {
    const sortedByTime = [...filteredRooms].sort((a, b) => {
      const aLast = a.lastUse
      const bLast = b.lastUse
      if ((!aLast || aLast.exit_time) && (!bLast || bLast.exit_time)) {
        return Number(a.number) - Number(b.number)
      }
      if (!aLast || aLast.exit_time) return -1
      if (!bLast || bLast.exit_time) return 1
      if (aLast.max_duration === 0 && bLast.max_duration === 0) {
        return Number(a.number) - Number(b.number)
      }
      if (aLast.max_duration === 0) return 1
      if (bLast.max_duration === 0) return -1
      const aEnd = new Date(aLast.entry_time).getTime() + aLast.max_duration * 60000
      const bEnd = new Date(bLast.entry_time).getTime() + bLast.max_duration * 60000
      return aEnd - bEnd
    })

    return (
      <div className="flex flex-col gap-4 px-4">
         <Title back={true} title="" button={ActionButtons} />
       {filtersVisible && <RoomTypeFilter />}
        <ScanHistoryPanel open={scanPanelOpen} onClose={closeScanPanel} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {sortedByTime.map((room) => (
            <RoomCard key={room.number} room={room} />
          ))}
        </div>
      </div>
    )
  }

  // === 🧾 MODE LISTE ===
  if (sortMode === "list") {
    const handleSort = (key: "number" | "timeRemaining") => {
      setSortConfig((prev) => {
        if (prev.key === key)
          return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        return { key, direction: "asc" }
      })
    }

    const sortedRoomsForList = [...filteredRooms].sort((a, b) => {
      const { key, direction } = sortConfig
      const order = direction === "asc" ? 1 : -1

      if (key === "number") {
        return (Number(a.number) - Number(b.number)) * order
      }

      if (key === "timeRemaining") {
        const aTime = a.timeRemaining ?? 0
        const bTime = b.timeRemaining ?? 0
        return (aTime - bTime) * order
      }

      return 0
    })

    return (
      <div className="flex flex-col gap-4 px-4">
        <Title back={true} title="" button={ActionButtons} />
        {filtersVisible && <RoomTypeFilter />}
        <ScanHistoryPanel open={scanPanelOpen} onClose={() => setScanPanelOpen(false)} />

        <div className="">
          <div className="overflow-x-auto border border-grey">
            <table className="min-w-full text-sm">
              <thead className="bg-grey text-left">
                <tr>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("number")}
                  >
                    Salle {sortConfig.key === "number" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Utilisateur</th>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("timeRemaining")}
                  >
                    Temps restant{" "}
                    {sortConfig.key === "timeRemaining" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedRoomsForList.map((room) => {
                  const currentUser =
                    !room.lastUse?.exit_time && room.lastUse?.user_full_name
                      ? room.lastUse.user_full_name
                      : "-"
                  const timeRemaining =
                    room.timeRemaining && room.lastUse && room.lastUse.max_duration > 0
                      ? formatHHMM(room.timeRemaining)
                      : "-"

                  return (
                    <tr
                      key={room.number}
                      className={`border-t border-grey ${colors[room.status]} transition`}
                    >
                      <td className="p-3 font-semibold">{room.number}</td>
                      <td className="p-3">{room.type}</td>
                      <td className="p-3">
                        {room.status === 1
                          ? "Libre"
                          : room.status === 0
                            ? "Occupée"
                            : "Réservée"}
                      </td>
                      <td className="p-3">{currentUser}</td>
                      <td className="p-3">{timeRemaining}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return null
}


