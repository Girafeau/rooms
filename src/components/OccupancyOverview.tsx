import { useEffect, useState } from "react"
import { useRoomsStore } from "../store/useRoomsStore"

interface OccupationStats {
  total: number
  occupied: number
  free: number
  occupancyRate: number
}

export default function OccupancyOverview() {
  const { rooms } = useRoomsStore()
  const [studioStats, setStudioStats] = useState<OccupationStats>({
    total: 0,
    occupied: 0,
    free: 0,
    occupancyRate: 0,
  })
  const [roomStats, setRoomStats] = useState<OccupationStats>({
    total: 0,
    occupied: 0,
    free: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    if (!rooms || rooms.length === 0) return

    const studios = rooms.filter((r) => r.type === "Studio")
    const normalRooms = rooms.filter((r) => r.type === "Salle")

    const calcStats = (list: typeof rooms) => {
      const total = list.length
      const occupied = list.filter(
        (r) =>
          (r.lastUse && !r.lastUse.exit_time) || // use en cours
          r.status === 0 || r.status === 2
      ).length
      const free = total - occupied
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
      return { total, occupied, free, occupancyRate }
    }

    setStudioStats(calcStats(studios))
    setRoomStats(calcStats(normalRooms))
  }, [rooms])

  return (
    <div className="flex gap-4">
      {/* Studios */}
      <div className="flex items-center gap-2 p-4">
        <h3 className="text-sm mb-2 text-center">studios : </h3>
      <div className="flex-1 w-40">
        
        <p className="text-sm text-center mb-1">
          {studioStats.occupied} / {studioStats.total}
        </p>
        <ScoreBar rate={studioStats.occupancyRate}/>
      </div>
      </div>

      {/* Salles */}
     <div className="flex items-center gap-2 p-4">
        <h3 className="text-sm mb-2 text-center">salles : </h3>
      <div className="flex-1 w-40">
        
        <p className="text-sm text-center mb-1">
          {roomStats.occupied} / {roomStats.total}
        </p>
        <ScoreBar rate={roomStats.occupancyRate}/>
      </div>
      </div>
    </div>
  )
}

type ScoreBarProps = {
    rate: number
  }

function ScoreBar({ rate }: ScoreBarProps) {
    
  
    // couleur selon score
    let colorClass = "bg-red"
    if (rate < 25) colorClass = "bg-green"
    else if (rate >= 25 && rate < 50) colorClass = "bg-yellow"
    else if (rate >= 50 && rate < 75) colorClass = "bg-orange"
  
    return (
        <div className="w-full bg-grey overflow-hidden relative">
        <div
          className={`${colorClass} p-1  h-full transition-all duration-300 flex items-center justify-center `}
          style={{ width: `${rate}%` }}
        >
          <span className={`${rate < 50 && "ml-5"} text-xs font-semibold`}>
            {rate}%
          </span>
        </div>
      </div>
    )
  }