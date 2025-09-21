import { useEffect, useRef, useState } from "react"
import stringSimilarity from "string-similarity"
import { useFilterStore } from "../store/useFilterStore"
import { useRoomsStore } from "../store/useRoomsStore"
import { buttonBase, inputBase } from "../App"
import { Check, Mic, MicOff, X } from "lucide-react"
import { supabase } from "../lib/supabase"

const students = [
  { id: 1, name: "Emma Viriot" },
  { id: 2, name: "Lucas Dupont" },
  { id: 3, name: "Jacqueline Martin" },
  { id: 4, name: "Jean Durand" },
]

export default function VoiceAssistant() {
  const { toggleNumber } = useFilterStore()
  const { rooms } = useRoomsStore()

  const [listening, setListening] = useState(false)
  const listeningRef = useRef(listening)
  const [buffer, setBuffer] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([])

  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const logsEndRef = useRef<HTMLDivElement | null>(null)

  // focus auto sur l’input nom
  useEffect(() => {
    if (selectedStudent && selectedStudio && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [selectedStudent, selectedStudio])

  // scroll auto des logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight
    }
  }, [logs])

  // sync ref avec state pour onend
  useEffect(() => {
    listeningRef.current = listening
  }, [listening])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Reconnaissance vocale non supportée.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "fr-FR"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onend = () => {
      if (listeningRef.current) recognition.start()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // ⚡ Cast pour compatibilité webkit
      const e = event as any
      let newWords: string[] = []

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          const transcript = result[0].transcript.trim()
          newWords = transcript.split(/\s+/)
        }
      }

      if (newWords.length > 0) {
        setBuffer((prev) => [...prev, ...newWords])
      }
    }

    recognitionRef.current = recognition
  }, [])

  // Analyse le buffer après le rendu
  useEffect(() => {
    if (buffer.length === 0) return
    const text = buffer.join(" ")
    analyze(text)
    setBuffer([])
  }, [buffer])

  const startListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.start()
    setListening(true)
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setListening(false)
  }

  const analyze = (text: string) => {
    setLogs((prev) => [...prev, `Texte : ${text}`])

    // 🔎 Détection studio
    const studioMatch = text.match(/\b(\d{2,3})\b/)
    if (studioMatch) {
      const detectedStudio = studioMatch[1]
      const exists = rooms.some((r) => r.number === detectedStudio)
      if (exists) {
        setSelectedStudio(detectedStudio)
        toggleNumber(detectedStudio)
      } else {
        setLogs((prev) => [...prev, `La salle ${detectedStudio} n'existe pas.`])
        setSelectedStudio(null)
      }
    }

    // 🔎 Détection élève
    const bestMatch = stringSimilarity.findBestMatch(
      text.toLowerCase(),
      students.map((s) => s.name.toLowerCase())
    )

    if (bestMatch.bestMatch.rating > 0.3) {
      const matchedName = bestMatch.bestMatch.target
      const student = students.find((s) => s.name.toLowerCase() === matchedName)
      if (student) setSelectedStudent(student)
    }
  }

  const validate = async () => {
    if (!selectedStudent || !selectedStudio) return

    try {
      const now = new Date().toISOString()

      // 1️⃣ Vérifier s’il existe déjà un use actif pour cette salle
      const { data: activeUses, error: activeErr } = await supabase
        .from("uses")
        .select("*")
        .eq("room_number", selectedStudio)
        .is("exit_time", null)

      if (activeErr) throw activeErr

      if (activeUses && activeUses.length > 0) {
        // 2️⃣ Clôturer l’ancien use
        const { error: updateErr } = await supabase
          .from("uses")
          .update({ exit_time: now })
          .eq("id", activeUses[0].id)

        if (updateErr) throw updateErr
      }

      // 3️⃣ Créer le nouveau use
      const { error: insertErr } = await supabase.from("uses").insert([
        {
          room_number: selectedStudio,
          user_full_name: selectedStudent.name,
          entry_time: new Date().toISOString(),
          max_duration: 120,
          exit_time: null,
        },
      ])

      if (insertErr) throw insertErr

      setLogs((prev) => [
        ...prev,
        `${selectedStudent.name.toUpperCase()} enregistré en ${selectedStudio} à ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
      ])
    } catch (err) {
      console.error(err)
    }

    // reset
    setSelectedStudent(null)
    setSelectedStudio(null)
  }

  const cancel = () => {
    setSelectedStudent(null)
    setSelectedStudio(null)
    setLogs((prev) => [...prev, "Annulé."])
  }

  return (
    <div className="relative">
      <div className="relative">
        {!listening ? (
          <button className={`${buttonBase} !p-4`} onClick={startListening}>
            <MicOff className="w-5 h-5 stroke-1" />
          </button>
        ) : (
          <button
            className={`${buttonBase} border-red text-red bg-red-light hover:bg-red-light !p-4`}
            onClick={stopListening}
          >
            <div className="relative">
              <Mic className="w-5 h-5 stroke-1" />
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red opacity-75 right-[-6px] top-[-4px]"></span>
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-red right-[-6px] top-[-4px]"></span>
            </div>
          </button>
        )}
      </div>

      {listening && (
        <div className="absolute top-20 right-0 p-4 bg-grey-transparent w-100 space-y-2 z-10 flex flex-col gap-2">
          <div
            ref={logsEndRef}
            className="border-1 border-dark-grey p-4 h-20 overflow-auto text-sm"
          >
            {logs.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          {selectedStudent && selectedStudio && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                validate()
              }}
              className="flex flex-col gap-2"
            >
              <input
                ref={nameInputRef}
                type="text"
                value={selectedStudent.name.toUpperCase()}
                onChange={(e) =>
                  setSelectedStudent({ ...selectedStudent, name: e.target.value })
                }
                className={`${inputBase} text-sm`}
              />
              <input
                type="text"
                value={selectedStudio}
                onChange={(e) => setSelectedStudio(e.target.value)}
                className={`${inputBase} text-sm`}
              />

              <div className="flex gap-2">
                <button type="submit" className={`${buttonBase}`}>
                  <Check className="w-5 h-5 stroke-1" />
                </button>
                <button type="button" className={`${buttonBase}`} onClick={cancel}>
                  <X className="w-5 h-5 stroke-1" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
