import { useState } from "react"
import Papa from "papaparse"

export default function CsvImporter() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage("Import en cours...")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";", // ⚠️ CSV FR = séparateur ;
      encoding: "UTF-8",
      beforeFirstChunk: (chunk) => {
        // enlever BOM éventuel
        return chunk.replace(/^\uFEFF/, "")
      },
      complete: async (results) => {
        console.log("Résultat brut PapaParse:", results)

        if (!results.data || results.data.length === 0) {
          setMessage("Aucune donnée détectée ❌")
          setLoading(false)
          return
        }

        const firstRow = results.data[0] as any
        console.log("Colonnes détectées:", Object.keys(firstRow))

        setMessage(`Fichier détecté avec ${results.data.length} lignes ✅`)
        setLoading(false)
      },
      error: (err) => {
        console.error("Erreur PapaParse:", err)
        setMessage("Erreur de parsing ❌")
        setLoading(false)
      },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="file" accept=".csv" onChange={handleFile} disabled={loading} />
      <p className="text-sm">{loading ? "Chargement..." : message}</p>
    </div>
  )
}
