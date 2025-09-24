import { useEffect, useRef, useState } from "react"
import { supabase } from "../lib/supabase"
import { Plus, X } from "lucide-react"
import { useScanStore } from "../store/useScanStore"
import { buttonBase, inputBase } from "../App"

export default function BarCodeListener() {
  const { scans, selectedScan, addScan, updateScan, setSelectedScan } = useScanStore()

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState("")
  const [formDuration, setFormDuration] = useState("120")

  const nameInputRef = useRef<HTMLInputElement | null>(null)

  // 👉 Focus auto quand on ouvre le formulaire
  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showForm])

  useEffect(() => {
    let buffer = ""
    let timeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
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

    addScan({ id, code, timestamp, userFullName: null, userId: null, duration: null })

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("barcode", code)
      .maybeSingle()

    if (error || !data) {
      updateScan(id, { userFullName: null })
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

  return (
    <div className="fixed bottom-4 right-4 w-96 p-4 bg-white border-1 border-dark-grey flex flex-col gap-3 z-50">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
         
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className={`${buttonBase}`}
        >
          {showForm ? <X className="w-5 h-5 stroke-1" /> : <Plus className="w-5 h-5 stroke-1" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
          <input
            ref={nameInputRef}
            type="text"
            value={formName.toUpperCase()}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="nom et prénom"
            className={`${inputBase} text-sm`}
          />
          <input
            type="number"
            value={formDuration}
            onChange={(e) => setFormDuration(e.target.value)}
            placeholder="durée (min)"
            className={`${inputBase} text-sm`}
          />
          <button type="submit" className={`${buttonBase}`}>
            <Plus className="w-5 h-5 stroke-1" />
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2 max-h-60 overflow-auto">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className={`p-2 border-1 cursor-pointer ${
              selectedScan?.id === scan.id ? "border-green-dark bg-green-light" : "border-dark-grey"
            }`}
            onClick={() => setSelectedScan(scan.id)}
          >
           <p className="text-sm">{scan.code}</p>
            <p className="font-semibold">
              {scan.userFullName?.toUpperCase() || "❌ Utilisateur introuvable"}
            </p>
             <p className="text-sm text-gray-500">
              {new Date(scan.timestamp).toLocaleTimeString()}
            </p>
            
          </div>
        ))}
      </div>
    </div>
  )
}
