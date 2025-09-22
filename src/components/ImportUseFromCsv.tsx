import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "../lib/supabase"
import { inputBase } from "../App"

interface CsvRow {
  "Nom de la salle"?: string
  Emprunteur?: string
  "Date de début"?: string
  "Heure de début"?: string
  "Heure de fin"?: string
}

export default function ImportUsesFromCsv() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const parseDateTime = (dateStr?: string, timeStr?: string): Date | null => {
    if (!dateStr || !timeStr) return null

    let [day, month, year] = [0, 0, 0]
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/")
      if (parts.length !== 3) return null
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
      year = parseInt(parts[2], 10)
    } else if (dateStr.includes("-")) {
      const parts = dateStr.split("-")
      if (parts.length !== 3) return null
      year = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
      day = parseInt(parts[2], 10)
    } else {
      return null
    }

    const [hours, minutes] = timeStr.split(":").map((n) => parseInt(n, 10))
    if (isNaN(hours) || isNaN(minutes)) return null

    return new Date(year, month, day, hours, minutes)
  }

  const handleFile = async (file: File) => {
    setLoading(true)
    setLogs([])

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data
        const usesToInsert = rows
          .map((row, index) => {
            console.log(row);
            
            if (!row["Nom de la salle"] || !row.Emprunteur || !row["Date de début"] || !row["Heure de début"]) {
              setLogs((prev) => [...prev, `⚠️ Ligne ${index + 1} incomplète ignorée.`])
              return null
            }

            const match = row["Nom de la salle"].match(/\d+/)
            const room_number = match ? match[0] : null
            if (!room_number) {
              setLogs((prev) => [...prev, `⚠️ Ligne ${index + 1}: impossible d’extraire le numéro de salle.`])
              return null
            }

            const entryDate = parseDateTime(row["Date de début"], row["Heure de début"])
            if (!entryDate) {
              setLogs((prev) => [...prev, `⚠️ Ligne ${index + 1}: date/heure invalide.`])
              return null
            }

            let max_duration = 0
            if (row["Heure de fin"]) {
              const endDate = parseDateTime(row["Date de début"], row["Heure de fin"])
              if (endDate) {
                const diff = (endDate.getTime() - entryDate.getTime()) / 60000
                max_duration = diff > 0 ? Math.round(diff) : 0
              }
            }

            return {
              room_number,
              user_full_name: row.Emprunteur,
              entry_time: entryDate.toISOString(),
              exit_time: null,
              max_duration,
            }
          })
          .filter(Boolean) // enlever les null
          .map((u) => u!)

        if (usesToInsert.length === 0) {
          setLogs((prev) => [...prev, "❌ Aucun use valide à insérer."])
          setLoading(false)
          return
        }

        const { error } = await supabase.from("uses").insert(usesToInsert)
        if (error) {
          console.error(error)
          setLogs((prev) => [...prev, `❌ Erreur : ${error.message}`])
        } else {
          setLogs((prev) => [...prev, `✅ ${usesToInsert.length} uses importés avec succès.`])
        }

        setLoading(false)
      },
    })
  }

  return (
    <div className="">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        disabled={loading}
        className={`${inputBase} text-sm`}
      />
      {loading && <p>⏳ Import en cours...</p>}
      <div className="text-sm">
        {logs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}
