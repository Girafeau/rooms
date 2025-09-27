import { useEffect, useRef, useState } from "react"
import { supabase } from "../lib/supabase"
import { Check, Plus, ScanBarcode, X, ChevronDown, ChevronUp } from "lucide-react"
import { useScanStore } from "../store/useScanStore"
import { buttonBase, inputBase } from "../App"

export default function BarCodeListener() {
  const { scans, selectedScan, addScan, updateScan, setSelectedScan } = useScanStore()

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState("")
  const [formDuration, setFormDuration] = useState("120")
  const [expanded, setExpanded] = useState(true)

  const nameInputRef = useRef<HTMLInputElement | null>(null)

  // 👉 Focus auto quand on ouvre le formulaire manuel
  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showForm])

  // Gestion du scanner
  useEffect(() => {
    let buffer = ""
    let timeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // ✅ Ignorer si focus dans un input/textarea/select
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        buffer = ""
      }, 300)

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          handleScan(buffer)
          buffer = ""
        }
      } else {
        if (e.key.length === 1) {
          buffer += e.key
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearTimeout(timeout)
    }
  }, [])

  const handleScan = async (code: string) => {
    const id = `${Date.now()}-${code}`
    const timestamp = new Date().toISOString()

    addScan({ id, code, timestamp, userFullName: null, userId: null, duration: 120 })

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("barcode", code)
      .maybeSingle()

    if (error || !data) {
      updateScan(id, { userFullName: null, userId: null })
    } else {
      updateScan(id, { userFullName: data.full_name, userId: data.id })
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    const id = `${Date.now()}-manual`
    const timestamp = new Date().toISOString()

    addScan({
      id,
      code: "0",
      timestamp,
      userFullName: formName.trim(),
      userId: null,
      duration: Number(formDuration) || null,
    })

    setFormName("")
    setFormDuration("120")
    setShowForm(false)
  }

  const handleRegisterUnknown = async (scanId: string, name: string) => {
    if (!name.trim()) return
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ 
          full_name: name.trim().toUpperCase(), 
          barcode: scans.find((s) => s.id === scanId)?.code 
        }])
        .select()
        .single()

      if (error) throw error
      if (data) {
        updateScan(scanId, { userFullName: data.full_name, userId: data.id })
      }
    } catch (err) {
      console.error("Erreur d'ajout utilisateur:", err)
    }
  }

   const lastScan = scans[0]

  return (
    <div className={`fixed bottom-4 right-4 ${
                 expanded
                    ? "w-100"
                    : "w-40"
                } p-4 bg-white border-1 border-dark-grey flex flex-col gap-3 z-50`}>

      {/* Header avec bouton toggle */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          <ScanBarcode className="w-5 h-5 stroke-1" />
        </h2>
        <button onClick={() => setExpanded((s) => !s)} className={`${buttonBase} !w-auto !p-2`}>
          {expanded ? <ChevronDown className="w-5 h-5 stroke-1" /> : <ChevronUp className="w-5 h-5 stroke-1" />}
        </button>
      </div>

      {/* Mode réduit */}
      {!expanded && lastScan && (
        <div className="text-sm">
          <span>{lastScan.userFullName?.toUpperCase() || "Un utilisateur inconnu"}</span> a été scanné à{" "}
          {new Date(lastScan.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
        </div>
      )}

      {/* Mode complet */}
      {expanded && (
        <>
          {!showForm && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className={`${buttonBase}`}
            >
              <Plus className="w-5 h-5 stroke-1" />
            </button>
          )}

          {showForm && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
              <p className="text-sm">Nom et prénom : </p>
              <input
                ref={nameInputRef}
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value.toUpperCase())}
                placeholder="ex : MOLIN PAUL"
                className={`${inputBase} text-sm`}
              />
              <div className="flex gap-2">
                <button type="submit" className={`${buttonBase}`}>
                  <Check className="w-5 h-5 stroke-1" />
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className={`${buttonBase}`}
                  type="button"
                >
                  <X className="w-5 h-5 stroke-1" />
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-2 max-h-60 overflow-auto">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className={`p-2 border-1 border-dark-grey cursor-pointer ${
                  !scan.userFullName ? "flex flex-col gap-2" : ""
                } ${
                  selectedScan?.id === scan.id
                    ? "border-3 "
                    : ""
                }`}
                onClick={() => setSelectedScan(scan.id)}
              >
                <p className="text-sm">{scan.code}</p>

                {scan.userFullName ? (
                  <p className="font-semibold">{scan.userFullName.toUpperCase()}</p>
                ) : (
                  <UnknownUserForm
                    scanId={scan.id}
                    onRegister={handleRegisterUnknown}
                  />
                )}

                <p className="text-gray-500">
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function UnknownUserForm({ scanId, onRegister }: { scanId: string; onRegister: (id: string, name: string) => void }) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onRegister(scanId, name)
    setName("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="text-sm">Nom et prénom : </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        placeholder="ex : MOLIN PAUL"
        className={`${inputBase} w-full text-sm`}
      />
      <button type="submit" className={`${buttonBase}`}>
        <Check className="w-5 h-5 stroke-1" />
      </button>
    </form>
  )
}
