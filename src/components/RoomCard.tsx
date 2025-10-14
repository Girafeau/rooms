import { useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { Plus, UserPlus, UserPen, UserMinus } from "lucide-react"
import { ScoreBar } from "./ScoreBar"
import formatHHMM from "../utils/format"
import { buttonBase } from "../App"
import { RoomPanel } from "./RoomPanel"
import { useRoomActions } from "../hooks/useRoomActions"

type Props = {
  room: RoomWithStatus
}

const colors: Record<RoomWithStatus["status"], string> = {
  1: "bg-green",
  0: "bg-red",
  3: "bg-red",
  2: "bg-orange",
}

const darkColors: Record<RoomWithStatus["status"], string> = {
  1: "text-green-dark",
  0: "text-red-dark",
  3: "text-red-dark",
  2: "text-orange-dark",
}

const lightColors: Record<RoomWithStatus["status"], string> = {
  1: "bg-green-light",
  0: "bg-red-light",
  3: "bg-red-light",
  2: "bg-orange-light",
}

export function RoomCard({ room }: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const { handleAddUse, handleExit, loading, errorMessage, handleAddMoreDuration } = useRoomActions(room)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div
          className={`p-4 flex flex-col transition ${"cursor-pointer"
            }  ${colors[room.status]} ${room.status === 3 ? "striped-background-danger" : ""
            }`}
          onClick={() => setPanelOpen(true)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className={`text-lg font-bold mr-4`}>
                {room.number}
              </h3>
            </div>
            {true && (
              <span
                className={`text-sm font-semibold truncate cursor-default ${darkColors[room.status]}`}
              >
                {room.type.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {(room.hidden_description || room.status === 3) && (
          <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
            <p className="text-sm">{room.status === 3 && "Pas disponible à l'utilisation. "}{room.hidden_description}</p>
          </div>
        )}
      </div>

      {room.score && (
        <div className="w-full">
          <ScoreBar score={room.score} maxScore={10} />
        </div>
      )}

      {(room.status === 0 || room.status === 2) && room.lastUse && (
        <div className="flex flex-col">
          <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
            <p className="font-semibold">
              {room.lastUse.user_full_name.toUpperCase()}
            </p>
            <div className="flex justify-between">
              <p>
                {new Date(room.lastUse.entry_time)
                  .toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .replace(",", "")}
              </p>
              {room.timeRemaining && room.lastUse.max_duration > 0 && (
                <p>{formatHHMM(room.timeRemaining)}</p>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <button
              className={`${buttonBase}`}
              onClick={handleExit}
              disabled={loading}
            >
              <UserMinus className="w-5 h-5 stroke-1" />
            </button>
            <button
              className={`${buttonBase}`}
              onClick={() => handleAddUse(true)}
              disabled={loading}
            >
              <UserPen className="w-5 h-5 stroke-1" />
            </button>
            {room.lastUse.max_duration > 0 && (
              <button
                className={`${buttonBase}`}
                onClick={handleAddMoreDuration}
                disabled={loading}
              >
                <Plus className="w-5 h-5 stroke-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {room.status === 1 && (
        <div className="flex flex-col gap-2">
          <button
            className={`${buttonBase}`}
            onClick={() => handleAddUse(false)}
            disabled={loading}
          >
            <UserPlus className="w-5 h-5 stroke-1" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 text-red bg-red-light text-sm">
          <p>{errorMessage}</p>
        </div>
      )}

      <RoomPanel
        room={room}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  )
}
