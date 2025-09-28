import { useEffect, useRef, useState } from "react"
import { supabase } from "../lib/supabase"
import { Check, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { useScanStore } from "../store/useScanStore"
import { buttonBase, inputBase } from "../App"
import { IconCheckbox } from "./IconCheckbox"

export default function BarCodeListener() {
  const { scans, selectedScan, addScan, updateScan, setSelectedScan, removeScan } = useScanStore()

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

  const handleCancelUnknown = (scanId: string) => {
    removeScan(scanId)
    if (selectedScan?.id === scanId) {
      setSelectedScan(null)
    }
  }

  const lastScan = scans[0] || null

  return (
    <div className={`fixed bottom-4 right-4 ${
      expanded ? "w-100" : "w-auto"
    } p-4  flex flex-col gap-3 z-50`}>

      {/* Header avec bouton toggle */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          
        </h2>
        <button onClick={() => setExpanded((s) => !s)} className={`${buttonBase} !w-auto !p-4`}>
          {expanded ? <ChevronDown className="w-5 h-5 stroke-1" /> : <ChevronUp className="w-5 h-5 stroke-1" />}
        </button>
      </div>

      {/* Mode réduit */}
      {!expanded && lastScan && (
        <div className="text-sm p-4 bg-grey">
          <span>{lastScan.userFullName?.toUpperCase() || "Un utilisateur inconnu"}</span> a été scanné à{" "}
          {new Date(lastScan.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
        </div>
      )}

      {/* Mode complet */}
      {expanded && (
        <>
          {!showForm && (
            <div className="flex flex-col gap-2 p-4 border-dashed border-1 border-dark-grey-2 bg-white">
              <p className="text-sm">Ajoutez manuellement un utilisateur :</p>
              <button
                onClick={() => setShowForm((s) => !s)}
                className={`${buttonBase}`}
              >
                <Plus className="w-5 h-5 stroke-1" />
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 p-4 border-dashed border-1 border-dark-grey-2 bg-white">
            
              <p className="text-sm">Nom et prénom : </p><input
                ref={nameInputRef}
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value.toUpperCase())}
                placeholder="ex : MOLIN PAUL"
                className={`${inputBase} text-sm`}
              />
              <div className="flex gap-2">
                <button type="submit" className={`${buttonBase} text-green-dark !bg-green-light hover:bg-green-light hover:outline-1 hover:outline-green`}>
                  <Check className="w-5 h-5 stroke-1" />
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className={`${buttonBase} text-red bg-red-light hover:bg-red-light hover:outline-1 hover:outline-red`}
                  type="button"
                >
                  <X className="w-5 h-5 stroke-1" />
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-2 p-4 max-h-100 overflow-auto border-dashed border-1 border-dark-grey-2 bg-white">
            {scans.length > 0 && <p className="text-sm">Liste des scans :</p>}
            {scans.map((scan) => (
              <div
                key={scan.id}
                className={`p-4 cursor-pointer rounded relative ${
                  selectedScan?.id === scan.id ? "bg-grey-transparent" : ""
                }`}
                onClick={() => setSelectedScan(scan.id)}
              >
                <div className="absolute top-4 right-4">
                <IconCheckbox label={""} checked={selectedScan?.id === scan.id}/>
                </div>
                <p className="text-sm">{scan.code}</p>

                {scan.userFullName ? (
                  <p className="font-semibold">{scan.userFullName.toUpperCase()}</p>
                ) : (
                  <UnknownUserForm
                    scanId={scan.id}
                    onRegister={handleRegisterUnknown}
                    onCancel={handleCancelUnknown}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onRegister(scanId, name)
    setName("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2 mb-2">
      <p className="text-sm text-red p-4 bg-red-light">L'utilisateur n'est pas encore connu.</p>
      <p className="text-sm">Nom et prénom :</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        placeholder="ex : MOLIN PAUL"
        className={`${inputBase} w-full text-sm`}
      />
      <div className="flex gap-2">
        <button type="submit" className={`${buttonBase} text-green-dark !bg-green-light hover:bg-green-light hover:outline-1 hover:outline-green`}>
          <Check className="w-5 h-5 stroke-1" />
        </button>
        <button type="button" onClick={() => onCancel(scanId)} className={`${buttonBase} text-red bg-red-light hover:bg-red-light hover:outline-1 hover:outline-red`}>
          <X className="w-5 h-5 stroke-1" />
        </button>
      </div>
    </form>
  )
}
