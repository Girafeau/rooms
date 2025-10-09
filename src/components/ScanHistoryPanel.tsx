import { useState, useEffect } from "react"
import { useScanStore } from "../store/useScanStore"
import { supabase } from "../lib/supabase"
import { buttonBase, inputBase } from "../App"
import { Check, Plus, X } from "lucide-react"

type Props = { open: boolean; onClose: () => void }

export function ScanHistoryPanel({ open, onClose }: Props) {
  const { scans, selectedScan, setSelectedScan, removeScan, updateScan, addScan } = useScanStore()
  const [showManualModal, setShowManualModal] = useState(false)

  const handleRegisterUnknown = async (scanId: string, name: string) => {
    if (!name.trim()) return
    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name: name.trim().toUpperCase(), barcode: scans.find((s) => s.id === scanId)?.code }])
      .select()
      .single()
    if (!error && data) updateScan(scanId, { userFullName: data.full_name, userId: data.id })
  }

  const handleCancelUnknown = (scanId: string) => {
    removeScan(scanId)
    if (selectedScan?.id === scanId) setSelectedScan(null)
  }

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
          <h2 className="font-semibold text-lg">Historique des scans</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualModal(true)}
              className={`${buttonBase} !w-auto !p-4`}
            >
              <Plus className="w-5 h-5 stroke-1" />
            </button>
            <button onClick={onClose} className={`${buttonBase} !w-auto !p-4`}>
              <X className="w-5 h-5 stroke-1" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
          {/* Liste des scans */}
          <div className="flex flex-col gap-2">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className={`relative p-3 border rounded cursor-pointer transition ${
                  selectedScan?.id === scan.id ? "bg-grey" : "bg-grey-transparent"
                }`}
                onClick={() => setSelectedScan(scan.id)}
              >
                {/* ✅ Checkbox visuelle */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-4 h-4 border border-black flex items-center justify-center rounded-sm ${
                      selectedScan?.id === scan.id ? "bg-black text-white" : "bg-white"
                    }`}
                  >
                    {selectedScan?.id === scan.id && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-sm text-gray-700">{scan.code}</p>
                {scan.userFullName ? (
                  <p className="font-semibold">{scan.userFullName.toUpperCase()}</p>
                ) : (
                  <UnknownUserForm
                    scanId={scan.id}
                    onRegister={handleRegisterUnknown}
                    onCancel={handleCancelUnknown}
                  />
                )}
                <p className="text-xs text-gray-500">
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Modal d’ajout manuel */}
      {showManualModal && (
        <ManualAddModal
          onClose={() => setShowManualModal(false)}
          onAdd={(user) => {
            const id = `${Date.now()}-manual`
            const timestamp = new Date().toISOString()
            addScan({
              id,
              code: user.barcode ?? "manuel", // 👈 si pas trouvé, on met "manuel"
              timestamp,
              userFullName: user.full_name,
              userId: user.id ?? null,
              duration: 120,
            })
            setShowManualModal(false)
          }}
        />
      )}
    </>
  )
}

function ManualAddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (user: { id?: number | null; full_name: string; barcode?: string }) => void
}) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<{ id: number; full_name: string; barcode?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [noResult, setNoResult] = useState(false)

  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      setNoResult(false)
      return
    }

    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, barcode")
        .ilike("full_name", `%${search}%`)
        .limit(10)

      if (!error) {
        setResults(data || [])
        setNoResult(data?.length === 0)
      }
      setLoading(false)
    }

    const timeout = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="fixed inset-0 bg-grey-transparent flex items-center justify-center z-50">
      <div className="bg-white w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between mx-4 py-4 border-b border-grey">
          <h2 className="font-semibold">Ajouter un scan manuel</h2>
          <button onClick={onClose} className={`${buttonBase} !w-auto !p-4`}>
            <X className="w-5 h-5 stroke-1" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4">
          <p className="text-sm">Nom et prénom</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="ex : MOLIN PAUL"
            className={`${inputBase} text-sm`}
          />
          {loading && <p className="text-sm text-gray-500">Recherche...</p>}

          {/* Résultats */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {results.map((user) => (
              <div
                key={user.id}
                className="p-4 cursor-pointer hover:bg-grey transition bg-grey-transparent"
                onClick={() => onAdd(user)}
              >
                <p className="text-sm text-gray-500">{user.barcode}</p>
                <p className="font-medium">{user.full_name}</p>
                
              </div>
            ))}

            {/* Aucun résultat → bouton d’ajout manuel */}
            {noResult && !loading && (
              <div>
                <p className="text-sm mb-2 text-red p-4 bg-red-light">Pas d'utilisateur trouvé.</p>
                <button
                  className={`${buttonBase} text-sm`}
                  onClick={() =>
                    onAdd({
                      id: null,
                      full_name: search.trim().toUpperCase(),
                      barcode: "ajout manuel",
                    })
                  }
                >
                  <Plus className="w-5 h-5 stroke-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UnknownUserForm({
  scanId,
  onRegister,
  onCancel,
}: {
  scanId: string
  onRegister: (id: string, name: string) => void
  onCancel: (id: string) => void
}) {
  const [name, setName] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onRegister(scanId, name)
      }}
      className="flex flex-col gap-2 mt-2"
    >
      <p className="text-xs text-red">L'utilisateur est inconnu.</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        placeholder="Nom & prénom"
        className={inputBase}
      />
      <div className="flex gap-2">
        <button type="submit" className={`${buttonBase} text-green-dark`}>
          <Check className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onCancel(scanId)} className={`${buttonBase} text-red`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
