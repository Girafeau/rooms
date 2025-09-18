import { useFilterStore } from "../store/useFilterStore"
import { types } from "../types/Room"
import { buttonBase } from "../App"
import { Check } from "lucide-react"

export function RoomTypeFilter() {
  const { filteredTypes, toggleType } = useFilterStore()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {types.map((type) => {
        const isChecked = filteredTypes.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`flex items-center gap-2 border transition text-sm ${buttonBase}
              ${isChecked ? " !bg-dark-grey" : ""}
              `}
          >
            {isChecked && <Check className="w-3 h-3 stroke-2" />}
            <span>{type}</span>
          </button>
        )
      })}
    </div>
  )
}
