import { useSettingsStore } from "../store/useSettingsStore"
import { IconCheckbox } from "./IconCheckbox"
import ExportUsesButton from "./ExportUsesButton"
import ImportUsesFromCsv from "./ImportUseFromCsv"

export function Settings() {
  const { showScores, toggleScores, showTimeRemaining, toggleTimeRemaining, showInRed, toggleInRed, showReservedRooms, toggleReservedRooms } = useSettingsStore()
console.log(showTimeRemaining);


  return (
    <div>
      {/* Panneau */}
      {true && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3>Paramètres</h3>
            <IconCheckbox
              label="Masquer la notation des studios"
              checked={!showScores}
              onChange={toggleScores}
            />
            <IconCheckbox
              label="Ignorer la vérification des accès aux salles"
              checked={!showScores}
              onChange={toggleScores}
            />
            <IconCheckbox
              label="Ignorer la vérification des bans"
              checked={!showScores}
              onChange={toggleScores}
            />
            <IconCheckbox
              label="Interdire l'insertion manuelle"
              checked={!showScores}
              onChange={toggleScores}
            />
          </div>

              <div className="flex flex-col gap-2">
            <h3>Paramètres</h3>
            <IconCheckbox
              label="Masquer les temps restants"
             checked={!showTimeRemaining}
              onChange={toggleTimeRemaining}
            />
            <IconCheckbox
              label="Masquer les studios spéciaux"
              checked={!showReservedRooms}
              onChange={toggleReservedRooms}
            />
             <IconCheckbox
              label="Afficher les studios délogeables en rouge"
              checked={showInRed}
              onChange={toggleInRed}
            />

            
          </div>

          <ExportUsesButton />
           <h3>Importer les utilisations de salle</h3>
          <ImportUsesFromCsv />
        </div>
      )}
    </div>
  )
}
