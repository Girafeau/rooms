import { useSettingsStore } from "../store/useSettingsStore"
import { Settings as SettingsIcon, X } from "lucide-react"
import { IconCheckbox } from "./IconCheckbox"
import { buttonBase } from "../App"
import ExportUsesButton from "./ExportUsesButton"
import ImportUsesFromCsv from "./ImportUseFromCsv"
import { supabase } from "../lib/supabase"

export function Settings() {
  const { showScores, toggleScores, isOpen, toggleOpen, showVoiceAssitant, toggleVoiceAssitant } = useSettingsStore()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // redirection optionnelle si tu as une page de login
      window.location.href = "/connexion"
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err)
    }
  }

  return (
    <div className="relative">
      {/* Bouton pour ouvrir/fermer */}
      <div className="relative">
        <button
          onClick={toggleOpen}
          className={`${buttonBase} !p-4`}
        >
          {isOpen ? <X className="w-5 h-5 stroke-1" /> : <SettingsIcon className="w-5 h-5 stroke-1" />}
        </button>
      </div>

      {/* Panneau */}
      {isOpen && (
        <div className="absolute top-20 right-0 p-4 bg-white w-100 z-10 flex flex-col gap-3 ">
          <div className="flex flex-col gap-1">
            <h3>Paramètres</h3>
            <IconCheckbox
              label="Masquer la notation des studios"
              checked={!showScores}
              onChange={toggleScores}
            />
            <IconCheckbox
              label="Masquer l'assistant vocal"
              checked={!showVoiceAssitant}
              onChange={toggleVoiceAssitant}
            />
          </div>

          <ExportUsesButton />
          <ImportUsesFromCsv />

          {/* Bouton Déconnexion */}
          <button
            onClick={handleLogout}
            className={`${buttonBase} text-sm flex items-center gap-2 justify-center text-red bg-red-light hover:bg-red-light hover:outline-1 hover:outline-red`}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
