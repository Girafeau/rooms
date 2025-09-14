import { useEffect, useRef, useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { supabase } from "../lib/supabase"
import { Check, X, Plus, Minus } from "lucide-react"
import { ScoreBar } from "./ScoreBar"
import { useSettingsStore } from "../store/useSettingsStore"
import formatHHMM from "../utils/format"

type Props = {
    room: RoomWithStatus
}

const colors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green",
    0: "bg-red",
    2: "bg-orange"
}

const darkColors: Record<RoomWithStatus["status"], string> = {
    1: "",
    0: "",
    2: ""
}

const lightColors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green-light",
    0: "bg-red-light",
    2: "bg-orange-light"
}

export function RoomCard({ room }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { showScores } = useSettingsStore()
    const [showForm, setShowForm] = useState(false)
    const [replacing, setReplacing] = useState(false) // nouvel état pour remplacement
    const [personName, setPersonName] = useState("")
    const [duration, setDuration] = useState(120) // minutes par défaut
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (showForm && inputRef.current) {
            inputRef.current.focus()
        }
    }, [showForm])

    const handleAddUse = async () => {
        if (!personName || duration <= 0) return
        setLoading(true)

        // si on remplace, on termine l'utilisation actuelle avant
        if (replacing && room.lastUse) {
            const { error: exitError } = await supabase
                .from("uses")
                .update({ exit_time: new Date().toISOString() })
                .eq("id", room.lastUse.id)

            if (exitError) console.error(exitError)

        }

        const { error } = await supabase.from("uses").insert({
            room_id: room.id,
            user_full_name: personName,
            entry_time: new Date().toISOString(),
            max_duration: duration,
            exit_time: null
        })

        if (!error) {
            setPersonName("")
            setDuration(120)
            setShowForm(false)
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

    // bouton + pour remplacer, ouvre le formulaire mais ne termine pas encore
    const handlePrepareReplace = () => {
        setReplacing(true)
        setShowForm(true)
    }

    const buttonBase = "w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold transition-colors bg-grey border-1 border-dark-grey hover:bg-dark-grey disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

    return (
        <div className="flex flex-col gap-2">
            <div className={`p-4 flex flex-col transition ${colors[room.status]}`}>
                <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${darkColors[room.status]}`}>{room.number}</h3>
                
                </div>

                <p className="text-sm">{room.hidden_description}</p>
            </div>

            {showScores && room.score && (
                <div className="w-full">
                    <ScoreBar score={room.score} maxScore={10} />
                </div>
            )}

            {(room.status === 0 || room.status === 2) && room.lastUse && (
                <div className="flex flex-col">
                    <div className={`p-4 ${lightColors[room.status]} flex flex-col`}>
                        <p className="font-semibold">{room.lastUse.user_full_name}</p>
                        <div className="flex justify-between">
                            <p>
                                {new Date(room.lastUse.entry_time).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }).replace(",", "")}
                            </p>
                            {room.timeRemaining && <p>{formatHHMM(room.timeRemaining)}</p>}
                        </div>

                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                        <button
                            className={`${buttonBase}`}
                            onClick={handleExit}
                            disabled={loading}
                        >
                            <Minus className="w-5 h-5 stroke-1" />
                        </button>
                        <button
                            className={`${buttonBase}`}
                            onClick={handlePrepareReplace}
                            disabled={loading}
                        >
                            <Plus className="w-5 h-5 stroke-1" />
                        </button>
                    </div>
                </div>
            )}



            {room.status === 1 && !showForm && (
                <button
                    className={`${buttonBase}`}
                    onClick={() => setShowForm(true)}
                >
                    <Plus className="w-5 h-5 stroke-1" />
                </button>
            )}

            {showForm && (
                <form
                    className="flex flex-col gap-2 w-full"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleAddUse()
                    }}
                >
                    <hr className="border-dark-grey"></hr>
                    <p className="text-sm">Nom et prénom</p>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder=""
                        className="bg-grey px-4 py-2 w-full focus:border-sky-500 focus:outline focus:outline-dark-grey focus:invalid:border-red"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value.toUpperCase())}
                    />
                    <p className="text-sm">Durée (min)</p>
                    <input
                        type="number"
                        placeholder="Durée (min)"
                        className="bg-grey px-4 py-2 w-full focus:border-sky-500 focus:outline focus:outline-dark-grey focus:invalid:border-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <hr className="border-dark-grey"></hr>
                    <div className="flex gap-2">
                        <button
                            className={`${buttonBase}`}
                            onClick={handleAddUse}
                            disabled={loading}
                        >
                            <Check className="w-5 h-5 stroke-1" />
                        </button>
                        <button
                            className={`${buttonBase}`}
                            onClick={() => { setShowForm(false); setReplacing(false) }}
                        >
                            <X className="w-5 h-5 stroke-1" />
                        </button>
                    </div>
                </form>

            )}
        </div>
    )
}
