import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { Use } from "../types/Use"
import { inputBase } from "../App"

type Period = "today" | "yesterday" | "this_week" | "this_month" | "all_time"

export function LatestUsesPage() {
    const [uses, setUses] = useState<
        (Use & { room_number: number | null })[]
    >([])
    const [loading, setLoading] = useState(true)
    const [searchName, setSearchName] = useState("")
    const [searchRoom, setSearchRoom] = useState("")
    const [period, setPeriod] = useState<Period>("all_time")
    const [limit, setLimit] = useState(20)

    const fetchUses = async () => {
        setLoading(true)

        const { data, error } = await supabase.rpc("get_latest_uses", {
            p_search_name: searchName || null,
            p_search_room: searchRoom || null,
            p_period: period,
            p_limit: limit,
        })

        if (error) {
            console.error(error)
            setUses([])
        } else {
            // data contient use + room_number
            setUses((data as any) ?? [])
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUses()
    }, [searchName, searchRoom, period, limit])

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold">Dernières utilisations</h1>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-sm">Recherche par nom et prénom :</p>
                    <input
                        type="text"
                        placeholder="Rechercher un nom..."
                        className={`${inputBase}`}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
               
                <div className="flex flex-col gap-2">
                     <p className="text-sm">Recherche par numéro de salle :</p>
                    <input
                        type="text"
                        placeholder="Rechercher une salle..."
                        className={`${inputBase}`}
                        value={searchRoom}
                        onChange={(e) => setSearchRoom(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm">Période : </p>
                    <select
                        className={`${inputBase}  border-r-8 !border-transparent`}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                    >
                        <option value="today">Aujourd'hui</option>
                        <option value="yesterday">Hier</option>
                        <option value="this_week">Cette semaine</option>
                        <option value="this_month">Ce mois</option>
                        <option value="all_time">Tout le temps</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm">Limite de résultats :</p>
                    <input
                        type="number"
                        min={1}
                        className={`${inputBase}`}
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <p>Chargement...</p>
            ) : uses.length === 0 ? (
                <p>Aucune utilisation trouvée</p>
            ) : (
                <ul className="space-y-2">
                    {uses.map((use) => (
                        <li
                            key={use.id}
                            className="border p-2 rounded flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{use.user_full_name}</p>
                                <p className="text-sm text-gray-600">
                                    Salle #{use.room_number} –{" "}
                                    {new Date(use.entry_time).toLocaleString([], {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {use.exit_time
                                    ? `Sortie: ${new Date(use.exit_time).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}`
                                    : "En cours"}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
