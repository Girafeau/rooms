import { useState } from "react"
import { supabase } from "../lib/supabase"
import * as XLSX from "xlsx"
import { buttonBase, inputBase } from "../App"
import { FileDown } from "lucide-react"

export default function DownloadTeacherUses() {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const fetchAndDownload = async () => {
    setLoading(true)

    // 🔹 Récupérer tous les enseignants avec leurs uses filtrés par date
   const { data, error } = await supabase.rpc("get_teacher_uses", { p_date: date })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    // 🔹 Transformer pour Excel
    const allUses: any[] = []
    data?.forEach((u: any) => {
     
        allUses.push({
          "NOM PRÉNOM": u.teacher_full_name.toUpperCase(),
          "NUMÉRO DE SALLE": u.room_number,
          "ENTRÉE": u.entry_time,
          "SORTIE": u.exit_time ?? "",
        })
    
    })
    
    // 🔹 Générer et télécharger Excel
    const ws = XLSX.utils.json_to_sheet(allUses)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Uses")
    XLSX.writeFile(wb, `entrees_sorties_professeurs_${date}.xlsx`)

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-1">
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={date}
        onChange={(e) => {setDate(e.target.value)}}
         className={`${inputBase} text-sm flex-1`}
      />
      <button
        onClick={fetchAndDownload}
         className={`${buttonBase} !w-1/3`}
        disabled={loading}
      >
        {loading ? "..." : <FileDown className="w-5 h-5 stroke-1" />}
      </button>
      
    </div>
    <p className="text-sm">entrees_sorties_professeurs_{date}.xlsx</p>
    </div>
  )
}
