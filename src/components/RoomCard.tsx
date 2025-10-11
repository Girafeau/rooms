import { useEffect, useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { supabase } from "../lib/supabase"
import { Plus, UserPlus, UserPen, UserMinus, Check, Ban} from "lucide-react"
import { ScoreBar } from "./ScoreBar"
import formatHHMM from "../utils/format"
import { buttonBase } from "../App"
import { useScanStore } from "../store/useScanStore"

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

  const { selectedScan } = useScanStore()
  const [show, setShow] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!errorMessage) return
    const timer = setTimeout(() => setErrorMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [errorMessage])


  const checkAccessBans = async (userId: number) => {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("access_bans")
      .select("*")
      .eq("user_id", userId)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle()

    if (error) {
      console.error("Erreur checkAccessBans:", error)
      return { banned: false, reason: null, expires_at: null }
    }

    if (!data) {
      return { banned: false, reason: null, expires_at: null }
    }

    return {
      banned: true,
      reason: data.reason,
      expires_at: data.expires_at, // peut être null → ban à vie
    }
  }


  const checkAccessRights = async (userId: number, roomNumber: string) => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("access_rights")
      .select("*")
      .eq("user_id", userId)
      .eq("room_number", roomNumber)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle()

    if (error) {
      console.error(error)
      return false
    }
    return !!data
  }

  const handleSetUnavailable = async () => {
    setLoading(true)

    if (replacing && room.lastUse) {
      const { error: exitError } = await supabase
        .from("uses")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", room.lastUse.id)

      if (exitError) console.error(exitError)
    }

    try {
      const { error } = await supabase.from("uses").insert({
        room_number: room.number,
        user_full_name: "Indisponibilité".toUpperCase(),
        entry_time: new Date().toISOString(),
        max_duration: 0,
        exit_time: null,
        status: 0,
      })
      if (error) console.error(error)
    } finally {
      setReplacing(false)
      setLoading(false)
      setShow(false)
    }
  }

  const handleAddUse = async () => {
    if (!selectedScan || !selectedScan.userFullName) {
      setErrorMessage("Personne n'a été scanné.")
      return
    }

    if (selectedScan.userId) {
      const { banned, reason, expires_at } = await checkAccessBans(Number(selectedScan.userId))
      if (banned) {
        setErrorMessage(
          `L'utilisateur est banni
                  ${expires_at
            ? " jusqu'au " + new Date(expires_at!).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
              .replace(",", "")
            : " à vie "}${reason ? " pour la raison suivante : " + reason + " »" : "."}`
        )
        return
      }
    }

    // ✅ Vérification des droits
    if (room.is_restricted) {
      if (selectedScan.userId) {
        const hasAccess = await checkAccessRights(Number(selectedScan.userId), room.number)
        if (!hasAccess) {
          setErrorMessage("L'utilisateur n'est pas autorisé.")
          return
        }
      } else {
        setErrorMessage("Les droits ne peuvent pas être vérifiés car l'utilisateur n'est pas connu.")
        return
      }
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
    setShow(false)
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
      setShow(false)
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div
          className={`p-4 flex flex-col transition ${"cursor-pointer"
            }  ${colors[room.status]} ${room.status === 3 ? "striped-background-danger" : ""
            }`}
          onClick={() => setShow(!show)}
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

        {(room.hidden_description || room.status === 3)  && (
          <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
            <p className="text-sm">{room.status === 3 && "Pas disponible à l'utilisation. "}{room.hidden_description}</p>
          </div>
        )}
      </div>

      {show && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {room.status === 1 && (
              <button
                className={`${buttonBase} text-sm !w-auto bg-red-light text-red hover:bg-red-light-2`}
                onClick={handleSetUnavailable}
                disabled={loading}
              >
                <Ban className="w-5 h-5 stroke-1" />
              </button>
            )}
            {room.status === 3 && (
              <button
                className={`${buttonBase} text-sm !w-auto bg-green-light text-green-dark hover:bg-green-light-2`}
                onClick={handleExit}
                disabled={loading}
              >
                <Check className="w-5 h-5 stroke-1" />
              </button>
            )}
          </div>
          {room.teachers.length > 0 && room.status === 1 && (
            <div className="flex flex-col gap-1">
              {room.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex justify-between items-center"
                >
                  <span
                    className={`text-sm ${(room.status === 0 || room.status === 2) &&
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
                      className={`${buttonBase} !w-auto`}
                      onClick={handleExit}
                      disabled={loading}
                    >
                      <UserMinus className="w-5 h-5 stroke-1" />
                    </button>
                  ) : (
                    <button
                      className={`${buttonBase} !w-auto`}
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

        </div>
      )}

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
        </div>
      )}

        {errorMessage && (
            <div className="flex items-center gap-2 p-4 text-red bg-red-light text-sm">
              <p>{errorMessage}</p>
            </div>
          )}
    </div>
  )
}
