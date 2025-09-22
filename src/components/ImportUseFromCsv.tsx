import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "../lib/supabase"
import { inputBase } from "../App"

interface CsvRow {
  "Nom de la salle": string
  Emprunteur: string
  "Date de début": string // ex: "2025-09-22" ou "22/09/2025"
  "Heure de début": string // ex: "14:30"
  "Heure de fin"?: string // ex: "16:00"
}

export default function ImportUsesFromCsv() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    // Supporte "2025-09-22" ou "22/09/2025"
    let [day, month, year] = [0, 0, 0]
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/")
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
      year = parseInt(parts[2], 10)
    } else if (dateStr.includes("-")) {
      const parts = dateStr.split("-")
      year = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
      day = parseInt(parts[2], 10)
    }

    const [hours, minutes] = timeStr.split(":").map((n) => parseInt(n, 10))
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
        const usesToInsert = rows.map((row) => {
          // Extraire le numéro de salle (ex: "Salle 204" → "204")
          const match = row["Nom de la salle"].match(/\d+/)
          const room_number = match ? match[0] : null

          // Construire entry_time
          const entryDate = parseDateTime(row["Date de début"], row["Heure de début"])

          // Calculer max_duration
          let max_duration = 0
          if (row["Heure de fin"]) {
            const endDate = parseDateTime(row["Date de début"], row["Heure de fin"])
            const diff = (endDate.getTime() - entryDate.getTime()) / 60000 // minutes
            max_duration = diff > 0 ? Math.round(diff) : 0
          }

          return {
            room_number,
            user_full_name: row.Emprunteur,
            entry_time: entryDate.toISOString(),
            exit_time: null,
            max_duration,
          }
        })

        // Insérer en BDD
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
      {loading && <p>Lecture en cours.</p>}
      <div className="text-sm">
        {logs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}
