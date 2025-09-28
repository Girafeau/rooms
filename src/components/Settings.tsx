import { useSettingsStore } from "../store/useSettingsStore"
import { IconCheckbox } from "./IconCheckbox"
import ExportUsesButton from "./ExportUsesButton"
import ImportUsesFromCsv from "./ImportUseFromCsv"

export function Settings() {
  const { showScores, toggleScores, showVoiceAssitant, toggleVoiceAssitant } = useSettingsStore()


  return (
    <div>
      {/* Panneau */}
      {true && (
        <div className="flex flex-col gap-3 ">
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
        </div>
      )}
    </div>
  )
}
