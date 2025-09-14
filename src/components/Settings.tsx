import { useSettingsStore } from "../store/useSettingsStore"
import { Settings as SettingsIcon, X } from "lucide-react"

export function Settings() {
  const { showScores, toggleScores, isOpen, toggleOpen } = useSettingsStore()
  const buttonBase = "w-full flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-colors bg-grey border-1 border-dark-grey hover:bg-dark-grey disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"


  return (
    <div className="relative">
      {/* Bouton pour ouvrir/fermer */}
      <button
        onClick={toggleOpen}
        className={buttonBase}
      >
        {isOpen ? <X className="w-5 h-5 stroke-1" /> : <SettingsIcon className="w-5 h-5 stroke-1" />}
      </button>

      {/* Panneau */}
      {isOpen && (
        <div className="absolute top-20 right-0 p-4 bg-grey border-dark-grey w-100 space-y-2 z-10">
          <h3 className="mb-2">Paramètres</h3>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showScores}
              onChange={toggleScores}
              className="text-sm w-4 h-4"
            />
            <span>Afficher la notation des studios</span>
          </label>
        </div>
      )}
    </div>
  )
}
