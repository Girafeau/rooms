import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { buttonBase, inputBase } from "../App"
import { Plus, Ban, X, Check, Key } from "lucide-react"

type User = {
    id: number
    full_name: string
}

type AccessRight = {
    id: number
    room_number: string
    expires_at: string | null
}

type Ban = {
    id: number
    reason: string
    expires_at: string | null
}

const banDurations = [
    { label: "1 jour", value: 1 },
    { label: "3 jours", value: 3 },
    { label: "1 semaine", value: 7 },
    { label: "1 mois", value: 30 },
    { label: "1 an", value: 365 },
    { label: "À vie", value: null },
]

export default function AccessAndBanPage() {
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState("")
    const [roomSearch, setRoomSearch] = useState("")
    const [filterBan, setFilterBan] = useState<string[]>([])

    const [accessRights, setAccessRights] = useState<Record<number, AccessRight[]>>({})
    const [bans, setBans] = useState<Record<number, Ban | null>>({})

    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showAccessForm, setShowAccessForm] = useState(false)
    const [showBanForm, setShowBanForm] = useState(false)

    const [roomNumber, setRoomNumber] = useState("")
    const [expiresAt, setExpiresAt] = useState("")
    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<number | null>(1)

    // Charger utilisateurs
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from("users").select("id, full_name").order("full_name")
            if (error) {
                console.error(error)
            } else {
                setUsers(data)
            }
        }
        fetchUsers()
    }, [])

    // Charger accès et bans
    const fetchDetails = async () => {
        const { data: rights } = await supabase.from("access_rights").select("id, user_id, room_number, expires_at")
        const { data: bansData } = await supabase.from("access_bans").select("id, user_id, reason, expires_at")

        const now = new Date()

        const rightsMap: Record<number, AccessRight[]> = {}
        rights?.forEach((r) => {
            if (!rightsMap[r.user_id]) rightsMap[r.user_id] = []
            rightsMap[r.user_id].push({ id: r.id, room_number: r.room_number, expires_at: r.expires_at })
        })

        const bansMap: Record<number, Ban | null> = {}
        bansData?.forEach((b) => {
            if (!bansMap[b.user_id]) {
                if (!b.expires_at || new Date(b.expires_at) > now) {
                    bansMap[b.user_id] = { id: b.id, reason: b.reason, expires_at: b.expires_at }
                }
            }
        })

        setAccessRights(rightsMap)
        setBans(bansMap)
    }

    useEffect(() => {
        fetchDetails()
    }, [])

    // Date expiration par défaut
    useEffect(() => {
        const now = new Date()
        let year = now.getFullYear()
        if (now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() > 15)) {
            year = year + 1
        }
        const defaultDate = new Date(year, 8, 15)
        setExpiresAt(defaultDate.toISOString().slice(0, 10))
    }, [showAccessForm])

    // Ajouter accès
    const handleAddAccess = async () => {
        if (!selectedUser) return
        setLoading(true)
        const { data, error } = await supabase.from("access_rights").insert({
            user_id: selectedUser.id,
            room_number: roomNumber,
            expires_at: expiresAt,
        }).select().single()
        setLoading(false)
        if (error) console.error(error)
        if (data) {
            setAccessRights((prev) => ({
                ...prev,
                [selectedUser.id]: [...(prev[selectedUser.id] || []), data],
            }))
        }
        setRoomNumber("")
        setShowAccessForm(false)
    }

    // Supprimer accès
    const handleRemoveAccess = async (userId: number, accessId: number) => {
        const { error } = await supabase.from("access_rights").delete().eq("id", accessId)
        if (error) console.error(error)
        setAccessRights((prev) => ({
            ...prev,
            [userId]: prev[userId]?.filter((a) => a.id !== accessId) || [],
        }))
    }

    // Bannir
    const handleBanUser = async () => {
        if (!selectedUser) return
        setLoading(true)

        let expires_at: string | null = null
        if (banDuration) {
            const now = new Date()
            now.setDate(now.getDate() + banDuration)
            expires_at = now.toISOString()
        }

        const { data, error } = await supabase.from("access_bans").insert({
            user_id: selectedUser.id,
            reason: banReason,
            expires_at,
        }).select().single()

        setLoading(false)
        if (error) console.error(error)
        if (data) {
            setBans((prev) => ({ ...prev, [selectedUser.id]: data }))
        }
        setBanReason("")
        setBanDuration(1)
        setShowBanForm(false)
    }

    // Lever ban
    const handleRemoveBan = async (banId: number, userId: number) => {
        const { error } = await supabase.from("access_bans").delete().eq("id", banId)
        if (error) console.error(error)
        setBans((prev) => ({ ...prev, [userId]: null }))
    }

    const filteredUsers = users.filter((u) => {
        const nameMatch = u.full_name.toLowerCase().includes(search.toLowerCase())
        const roomMatch = roomSearch
            ? accessRights[u.id]?.some((r) =>
                r.room_number.toLowerCase().includes(roomSearch.toLowerCase())
            )
            : true

        const isBanned = !!bans[u.id]
        const banMatch =
            filterBan.length === 0 // si aucun filtre choisi -> tout
                ? true
                : (isBanned && filterBan.includes("banned")) ||
                (!isBanned && filterBan.includes("notBanned"))

        return nameMatch && roomMatch && banMatch
    })

    return (
        <div className="p-6 flex flex-col gap-4">
            <h1 className="text-5xl font-bold font-title mb-8">Gestion des utilisateurs.</h1>

            {/* Barre de recherche et filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-sm">Recherche par nom et prénom :</p>
                    <input
                        type="text"
                        placeholder="ex : BAYER ALINA"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputBase} text-sm`}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm">Recherche par numéro de salle :</p>
                    <input
                        type="text"
                        placeholder="ex : 126"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        className={`${inputBase} text-sm`}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm">Liste des filtres :</p>
                    <div className="flex gap-2">
                        <div
                                      className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${filterBan.includes("banned")  ? "bg-dark-grey" : "bg-grey"}`}

                          
                            onClick={() =>
                                setFilterBan((prev) =>
                                    prev.includes("banned")
                                        ? prev.filter((f) => f !== "banned")
                                        : [...prev, "banned"]
                                )
                            }
                        >
                            status : banni
                        </div>
                        <div
                             className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${filterBan.includes("notBanned")  ? "bg-dark-grey" : "bg-grey"}`}

                          
                            onClick={() =>
                                setFilterBan((prev) =>
                                    prev.includes("notBanned")
                                        ? prev.filter((f) => f !== "notBanned")
                                        : [...prev, "notBanned"]
                                )
                            }
                        >
                            status : non banni
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="flex flex-col gap-4">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="border-1 border-dark-grey-2 p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{user.full_name.toUpperCase()}</span>
                            <div className="flex gap-2">
                                <button
                                    className={`${buttonBase} text-sm`}
                                    onClick={() => {
                                        setSelectedUser(user)
                                        setShowAccessForm(true)
                                    }}
                                >
                                    <Plus className="w-5 h-5 stroke-1" /><Key className="w-5 h-5 stroke-1" />
                                </button>
                                <button
                                    className={`${buttonBase} text-sm text-red bg-red-light`}
                                    onClick={() => {
                                        setSelectedUser(user)
                                        setShowBanForm(true)
                                    }}
                                >
                                    <Ban className="w-5 h-5 stroke-1" /> Bannir
                                </button>
                            </div>
                        </div>

                        {/* Accès */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm">Liste des accès :</p>
                            {accessRights[user.id]?.length ? (
                                <ul className="text-sm flex gap-2 flex-wrap">
                                    {accessRights[user.id].map((r) => (
                                        <div key={r.id} className="flex bg-grey items-center text-sm rounded-full py-2 px-3">
                                            <span>
                                                Salle <b>{r.room_number}</b>
                                                {r.expires_at
                                                    ? " jusqu'au " +
                                                    new Date(r.expires_at).toLocaleDateString("fr-FR", {
                                                        year: "numeric",
                                                        day: "2-digit",
                                                        month: "short",
                                                    }).replace(",", "")
                                                    : ""}
                                            </span>
                                            <X
                                                className="w-3 h-3 stroke-2 ml-2 cursor-pointer"
                                                onClick={() => handleRemoveAccess(user.id, r.id)}
                                            />
                                        </div>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">Pas d'accès.</p>
                            )}
                        </div>

                        {/* Ban */}
                        {bans[user.id] ? (
                            <div className="flex text-sm items-center justify-between text-red p-4 bg-red-light">
                                <p>
                                    Banni
                                    <b>
                                        {bans[user.id]?.expires_at
                                            ? " jusqu'au " +
                                            new Date(bans[user.id]!.expires_at!).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }).replace(",", "")
                                            : " à vie "}
                                    </b>{" "}
                                    pour la raison suivante : « {bans[user.id]?.reason}. »
                                </p>
                                <X
                                    className="w-5 h-5 stroke-1 cursor-pointer"
                                    onClick={() => handleRemoveBan(bans[user.id]!.id, user.id)}
                                />
                            </div>
                        ) : (
                            <p className="text-sm"></p>
                        )}
                    </div>
                ))}
            </div>

            {/* Formulaires */}
            {showAccessForm && selectedUser && (
                <Modal title={`Ajouter un accès pour ${selectedUser.full_name}`} onClose={() => setShowAccessForm(false)}>
                    <p className="text-sm">Numéro de salle :</p>
                    <input
                        type="text"
                        placeholder="ex : 126"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className={`${inputBase}`}
                    />
                    <p className="text-sm">Date d'expiration : </p>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className={`${inputBase}`}
                    />
                    <div className="flex gap-2 justify-end">
                        <button className={`${buttonBase}`} onClick={handleAddAccess} disabled={loading}>
                            <Check className="w-5 h-5 stroke-1" />
                        </button>
                        <button className={`${buttonBase}`} onClick={() => setShowAccessForm(false)}>
                            <X className="w-5 h-5 stroke-1" />
                        </button>
                    </div>
                </Modal>
            )}

            {showBanForm && selectedUser && (
                <Modal title={`Bannir ${selectedUser.full_name}`} onClose={() => setShowBanForm(false)}>
                    <p className="text-sm">Raison :</p>
                    <textarea
                        rows={3}
                        placeholder="ex : Dégradation du matériel."
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className={`${inputBase}`}
                    />
                    <p className="text-sm">Durée :</p>
                    <select
                        value={banDuration ?? "null"}
                        onChange={(e) =>
                            setBanDuration(e.target.value === "null" ? null : Number(e.target.value))
                        }
                        className={`${inputBase} border-r-8 !border-transparent`}
                    >
                        {banDurations.map((d, i) => (
                            <option key={i} value={d.value ?? "null"}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                    <hr className="border-grey mt-4"/>
                    <div className="flex gap-2 justify-end">
                        
                        <button type="submit" className={`${buttonBase} text-green-dark !bg-green-light hover:bg-green-light hover:outline-1 hover:outline-green-dark`} onClick={handleBanUser} disabled={loading}>
                            <Check className="w-5 h-5 stroke-1" />
                        </button>
                        <button className={`${buttonBase} text-red bg-red-light hover:bg-red-light hover:outline-1 hover:outline-red`} onClick={() => setShowBanForm(false)}>
                            <X className="w-5 h-5 stroke-1" />
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

function Modal({ title, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-grey-transparent flex items-center justify-center z-50">
            <div className="bg-white p-8 w-112 flex flex-col gap-2 border-dashed border-1 border-dark-grey-2">
                <h2 className="text-lg">{title}</h2>
                <hr className="border-grey mb-4"/>
                {children}
            </div>
        </div>
    )
}
