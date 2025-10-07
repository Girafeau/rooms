// src/components/BarCodeListener.tsx
import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useScanStore } from "../store/useScanStore"
import { useToastStore } from "../store/useToastStore"

export default function BarCodeListener() {
  const { addScan, updateScan } = useScanStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    let buffer = ""
    let timeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable
      )
        return

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        buffer = ""
      }, 300)

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          handleScan(buffer)
          buffer = ""
        }
      } else if (e.key.length === 1) {
        buffer += e.key
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

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("barcode", code)
      .maybeSingle()

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (!data) {
      updateScan(id, { userFullName: null, userId: null })
      addToast(`Un utilisateur inconnu a été scanné à ${time}.`)
    } else {
      updateScan(id, { userFullName: data.full_name, userId: data.id })
      addToast(`${data.full_name} a été scanné à ${time}.`)
    }
  }

  return null // plus d'UI ici, c’est un listener pur
}
