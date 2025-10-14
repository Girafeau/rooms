import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { X, UserPlus, UserMinus, Clock3, RefreshCcw, DoorClosedLocked, DoorOpen } from "lucide-react"
import { buttonBase } from "../App"
import { statusLabels, type RoomWithStatus } from "../types/Room"
import formatHHMM from "../utils/format"
import { useRoomActions } from "../hooks/useRoomActions"

type Props = {
    room: RoomWithStatus | null
    open: boolean
    onClose: () => void
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
export function RoomPanel({ room, open, onClose }: Props) {
    const [recentUses, setRecentUses] = useState<any[]>([])

    const { handleAddUse, handleExit, loading, handleAddTeacher, handleSetUnavailable } = useRoomActions(room)


    useEffect(() => {
        if (!room) return
        fetchRecentUses()
    }, [])

    const fetchRecentUses = async () => {
        if (!room) return
        const { data, error } = await supabase
            .from("uses")
            .select("*")
            .eq("room_number", room.number)
            .neq("status", 0) // Exclure les entrées annulées
            .order("entry_time", { ascending: false })
            .limit(3)
        if (!error && data) setRecentUses(data)
    }

    if (!room) return null

    return (
        <>
            {/* Overlay */}
            {open && <div className="fixed inset-0 bg-grey-transparent z-40" onClick={onClose} />}

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-120 bg-white border-l border-grey transform transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mx-4 py-4 border-b border-grey">
                    <div>
                        <h2 className="text-2xl">{room.number}</h2>
                        {room.name && <p className="text-sm text-grey-dark">{room.name.toUpperCase()}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {room.status === 1 && <button onClick={() => handleSetUnavailable(true)} className={`${buttonBase} !w-auto !p-4 bg-red-light text-red hover:bg-red-light-2`} title="Rendre la salle indisponible">
                            <DoorClosedLocked className="w-5 h-5 stroke-1" />
                        </button>}
                        {room.status === 3 && <button onClick={handleExit} className={`${buttonBase} !w-auto !p-4 bg-green-light text-green-dark hover:bg-green-light-2`} title="Rendre la salle disponible">
                            <DoorOpen className="w-5 h-5 stroke-1" />
                        </button>}
                        <button onClick={onClose} className={`${buttonBase} !w-auto !p-4`}>
                            <X className="w-5 h-5 stroke-1" />
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">

                    {/* Statut */}
                    <div>
  <div className={`p-4 ${colors[room.status]} ${room.status === 3 ? "striped-background-danger" : ""}`}>
                        <p className={`font-semibold text-sm ${darkColors[room.status]}`}>
                            {statusLabels[room.status].toUpperCase()}
                        </p>
                    </div>
                    {(room.hidden_description || room.status === 3) && (
                        <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
                            <p className="text-sm">{room.status === 3 && "Pas disponible à l'utilisation. "}{room.hidden_description}</p>
                        </div>
                    )}
                    </div>
                  

                    {/* Dernier use */}
                    {room.lastUse && room.status !== 1 && room.status !== 3 && (
                        <div className={`p-4 ${lightColors[room.status]} flex flex-col gap-2`}>
                            <p className="font-semibold">{room.lastUse.user_full_name}</p>
                            <p className="text-sm">
                                Début :{" "}
                                {new Date(room.lastUse.entry_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                            {room.timeRemaining && room.lastUse.max_duration > 0 && (
                                <p className="text-sm flex items-center gap-2">
                                    <Clock3 className="w-4 h-4" /> {formatHHMM(room.timeRemaining)} restantes
                                </p>
                            )}
                            <button
                                className={`${buttonBase} text-sm mt-2`}
                                onClick={handleExit}
                                disabled={loading}
                            >
                                <UserMinus className="w-4 h-4 stroke-1" /> Marquer sortie
                            </button>
                        </div>
                    )}

                    {/* Liste des professeurs */}
                    {room.teachers.length > 0 &&
                        <div>
                            <p className="mb-2 text-sm">Liste des professeurs assignés :</p>
                            <div className="flex flex-col gap-2">
                                {room.teachers.map((t) => (
                                    <button
                                        key={t.id}
                                        className={`${buttonBase} justify-between`}
                                        onClick={() => handleAddTeacher(false, t.full_name)}
                                    >
                                        {t.full_name}
                                        <UserPlus className="w-4 h-4 stroke-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    }

                    {/* Historique */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm">Liste des derniers passages : </p>
                            <button
                                onClick={fetchRecentUses}
                                className={`${buttonBase} !w-auto !p-2`}
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {recentUses.map((use) => (
                                <div
                                    key={use.id}
                                    className="p-3 border border-grey rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-sm">{use.user_full_name}</p>
                                        <p className="text-xs text-grey-dark">
                                            {new Date(use.entry_time).toLocaleString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        className={`${buttonBase} !w-auto !p-2`}
                                        onClick={() => handleAddUse(use.user_full_name)}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {recentUses.length === 0 && <p className="text-sm">Pas d'historique disponible.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
