import { useEffect, useRef, useState } from "react"
import type { RoomWithStatus } from "../types/Room"
import { supabase } from "../lib/supabase"
import { Check, X, Plus, UserPlus, UserPen, UserMinus } from "lucide-react"
import { ScoreBar } from "./ScoreBar"
import { useSettingsStore } from "../store/useSettingsStore"
import formatHHMM from "../utils/format"
import { buttonBase, inputBase } from "../App"

type Props = {
    room: RoomWithStatus
}

const colors: Record<RoomWithStatus["status"], string> = {
    1: "bg-green",
    0: "bg-red",
    2: "bg-orange"
}

const darkColors: Record<RoomWithStatus["status"], string> = {
    1: "text-green-dark",
    0: "text-red-dark",
    2: "text-orange-dark"
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
    const [showTeachers, setShowTeachers] = useState(false)
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
        if (!personName) return
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
            room_number: room.number,
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

    const handleAddMoreDuration = async () => {
        if (!room.lastUse) return
        setLoading(true)

        const { error } = await supabase
            .from("uses")
            .update({ max_duration: (room.lastUse.max_duration || 0) + 120 }) // ajouter 2h
            .eq("id", room.lastUse.id)

        if (error) console.error(error)

        setLoading(false)
    }

    const handleAddTeacher = async (full_name: string) => {
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
            room_number: room.number,
            user_full_name: full_name,
            entry_time: new Date().toISOString(),
            max_duration: 0,
            exit_time: null
        })

        if (!error) {
            setPersonName("")
            setDuration(120)
            setShowForm(false)
            setReplacing(false)
            setShowTeachers(false)
        } else {
            console.error(error)
        }


        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="">
                <div className={`p-4 flex flex-col transition ${room.teachers.length > 0 && "cursor-pointer"}  ${colors[room.status]}`} onClick={() => setShowTeachers(!showTeachers)} >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <h3 className={`text-lg font-bold mr-4`}>{room.number}</h3>
                           
                        </div>
                        <span className={`text-sm font-semibold truncate cursor-default ${darkColors[room.status]}`}>{room.type.toUpperCase()}</span>

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
                        <div key={teacher.id} className="flex justify-between items-center">
                            <span className={`text-sm ${(room.status === 0 || room.status === 2) && room.lastUse && room.lastUse.user_full_name === teacher.full_name && darkColors[room.status]}`} key={teacher.id}>{teacher.full_name.toUpperCase()}</span>
                            {(room.status === 0 || room.status === 2) && room.lastUse && room.lastUse.user_full_name === teacher.full_name ? (
                                <button
                                    className={`${buttonBase} !w-auto rounded-none`}
                                    onClick={handleExit}
                                    disabled={loading}
                                >
                                    <UserMinus className="w-5 h-5 stroke-1" />
                                </button>
                            ) : <button
                                className={`${buttonBase} !w-auto rounded-none`}
                                onClick={() => handleAddTeacher(teacher.full_name)}
                                disabled={loading}
                            >
                                <UserPlus className="w-5 h-5 stroke-1" />
                            </button>}
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
                        <p className="font-semibold">{room.lastUse.user_full_name.toUpperCase()}</p>
                        <div className="flex justify-between">
                            <p>
                                {new Date(room.lastUse.entry_time).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }).replace(",", "")}
                            </p>
                            {room.timeRemaining && room.lastUse.max_duration > 0 && <p>{formatHHMM(room.timeRemaining)}</p>}
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
                        <button
                            className={`${buttonBase}`}
                            onClick={handleAddMoreDuration}
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
                    <UserPlus className="w-5 h-5 stroke-1" />
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
                    <div className="flex flex-col gap-1">
                        <p className="text-sm">Code barre</p>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder=""
                            className={`${inputBase} text-sm`}

                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm">Nom et prénom</p>
                        <input
                            type="text"
                            placeholder=""
                            className={`${inputBase} text-sm`}
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm">Durée (minutes)</p>
                        <input
                            type="number"
                            placeholder=""
                            className={`${inputBase} text-sm`}
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>
                    <hr className="border-dark-grey"></hr>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`${buttonBase}`}
                            onClick={handleAddUse}
                            disabled={loading}
                        >
                            <Check className="w-5 h-5 stroke-1" />
                        </button>
                        <button
                        type="button"
                            className={`${buttonBase}`}
                            onClick={() => {setShowForm(false); setReplacing(false) }}
                        >
                            <X className="w-5 h-5 stroke-1" />
                        </button>
                        
                    </div>
                </form>

            )}
        </div>
    )
}
