import { useSettingsStore } from "../store/useSettingsStore"
import { Settings as SettingsIcon, X } from "lucide-react"
import { IconCheckbox } from "./IconCheckbox"
import { buttonBase } from "../App"
import ExportUsesButton from "./ExportUsesButton"

export function Settings() {
  const { showScores, toggleScores, isOpen, toggleOpen, showVoiceAssitant, toggleVoiceAssitant } = useSettingsStore()

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
        <div className="absolute top-20 right-0 p-4 bg-grey-transparent w-100 z-10 flex flex-col gap-2 ">
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
          <ExportUsesButton/>
        </div>
      )}
    </div>
  )
}
