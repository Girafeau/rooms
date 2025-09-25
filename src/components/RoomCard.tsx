import { useEffect, useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { supabase } from "../lib/supabase"
import { Plus, UserPlus, UserPen, UserMinus } from "lucide-react"
import { ScoreBar } from "./ScoreBar"
import { useSettingsStore } from "../store/useSettingsStore"
import formatHHMM from "../utils/format"
import { buttonBase } from "../App"
import { useScanStore } from "../store/useScanStore"

type Props = {
  room: RoomWithStatus
}

const colors: Record<RoomWithStatus["status"], string> = {
  1: "bg-green",
  0: "bg-red",
  2: "bg-orange",
}

const darkColors: Record<RoomWithStatus["status"], string> = {
  1: "text-green-dark",
  0: "text-red-dark",
  2: "text-orange-dark",
}

const lightColors: Record<RoomWithStatus["status"], string> = {
  1: "bg-green-light",
  0: "bg-red-light",
  2: "bg-orange-light",
}

export function RoomCard({ room }: Props) {
  const { selectedScan } = useScanStore()
  const { showScores } = useSettingsStore()
  const [showTeachers, setShowTeachers] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
    if (!errorMessage) return
    const timer = setTimeout(() => setErrorMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [errorMessage])

  const handleAddUse = async () => {
    if (!selectedScan || !selectedScan.userFullName) {
      setErrorMessage("Pas d'utilisateur scanné.")
      return
    }
    setErrorMessage(null)
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    const { error } = await supabase.from("uses").insert({
      room_number: room.number,
      user_full_name: selectedScan.userFullName,
      entry_time: new Date().toISOString(),
      max_duration: selectedScan.duration,
      exit_time: null,
    })

    if (!error) {
      setReplacing(false)
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  const handleExit = async () => {
    if (!room.lastUse) return
    setLoading(true)

    const { error } = await supabase
      .from("uses")
      .update({ exit_time: new Date().toISOString() })
      .eq("id", room.lastUse.id)

    if (error) console.error(error)
    setLoading(false)
  }

  const handlePrepareReplace = () => {
    setReplacing(true)
    handleAddUse()
  }

  const handleAddMoreDuration = async () => {
    if (!room.lastUse) return
    setLoading(true)

    const { error } = await supabase
      .from("uses")
      .update({ max_duration: (room.lastUse.max_duration || 0) + 120 })
      .eq("id", room.lastUse.id)

    if (error) console.error(error)
    setLoading(false)
  }

  const handleAddTeacher = async (full_name: string) => {
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    const { error } = await supabase.from("uses").insert({
      room_number: room.number,
      user_full_name: full_name,
      entry_time: new Date().toISOString(),
      max_duration: 0,
      exit_time: null,
    })

    if (!error) {
      setReplacing(false)
      setShowTeachers(false)
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div
          className={`p-4 flex flex-col transition ${
            room.teachers.length > 0 && "cursor-pointer"
          }  ${colors[room.status]}`}
          onClick={() => setShowTeachers(!showTeachers)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className={`text-lg font-bold mr-4`}>{room.number}</h3>
            </div>
            <span
              className={`text-sm font-semibold truncate cursor-default ${darkColors[room.status]}`}
            >
              {room.type.toUpperCase()}
            </span>
          </div>
        </div>

        {room.hidden_description && (
          <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
            <p className="text-sm">{room.hidden_description}</p>
          </div>
        )}
      </div>

      {room.teachers.length > 0 && showTeachers && (
        <div className="flex flex-col gap-1">
          {room.teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex justify-between items-center"
            >
              <span
                className={`text-sm ${
                  (room.status === 0 || room.status === 2) &&
                  room.lastUse &&
                  room.lastUse.user_full_name === teacher.full_name &&
                  darkColors[room.status]
                }`}
              >
                {teacher.full_name.toUpperCase()}
              </span>
              {(room.status === 0 || room.status === 2) &&
              room.lastUse &&
              room.lastUse.user_full_name === teacher.full_name ? (
                <button
                  className={`${buttonBase} !w-auto rounded-none`}
                  onClick={handleExit}
                  disabled={loading}
                >
                  <UserMinus className="w-5 h-5 stroke-1" />
                </button>
              ) : (
                <button
                  className={`${buttonBase} !w-auto rounded-none`}
                  onClick={() => handleAddTeacher(teacher.full_name)}
                  disabled={loading}
                >
                  <UserPlus className="w-5 h-5 stroke-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showScores && room.score && (
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
              onClick={handlePrepareReplace}
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
            onClick={() => handleAddUse()}
            disabled={loading}
          >
            <UserPlus className="w-5 h-5 stroke-1" />
          </button>
          {errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-light text-sm">
            <p>{errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
