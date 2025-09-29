// src/components/BarCodeListener.tsx
import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useScanStore } from "../store/useScanStore"

export default function BarCodeListener() {
  const { addScan, updateScan } = useScanStore()

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
      ) return

      clearTimeout(timeout)
      timeout = setTimeout(() => { buffer = "" }, 300)

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

  return null
}
