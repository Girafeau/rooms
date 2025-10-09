import { useFilterStore } from "../store/useFilterStore"
import { statuses, types, reserved } from "../types/Room"
import { inputBase } from "../App"

export function RoomTypeFilter() {
  const {
    filteredTypes,
    filteredStatuses,
    filteredReserved,
    setRoomSearch,
    setNameSearch,
    toggleType,
    toggleStatus,
    toggleReserved,
    setSortMode,
    sortMode,
    roomSearch, nameSearch,
  } = useFilterStore()

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche par numéro de salle */}
        <div className="flex flex-col gap-2">
          <p className="text-sm">Recherche par numéro de salle</p>
          <input
            type="text"
            placeholder="ex : 432"
            className={`${inputBase} text-sm`}
            value={roomSearch}
            onChange={(e) => {
              const val = e.target.value
              setRoomSearch(val) // filtre en direct
            }}
          />
        </div>

        {/* Recherche par nom */}
        <div className="flex flex-col gap-2">
          <p className="text-sm">Recherche par nom</p>
          <input
            type="text"
            placeholder="ex : MOLIN PAUL"
            className={`${inputBase} text-sm`}
            value={nameSearch}
            onChange={(e) => {
              const val = e.target.value
              setNameSearch(val) // filtre en direct
            }}
          />
        </div>

        {/* Modes d’affichage */}
        <div className="flex flex-col gap-2">
          <p className="text-sm">Modes d'affichage</p>
          <div className="flex gap-2">
            <div
              onClick={() => setSortMode("floor")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                sortMode === "floor" ? "bg-dark-grey" : "bg-grey"
              }`}
            >
              étage décroissant
            </div>
            <div
              onClick={() => setSortMode("time")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                sortMode === "time" ? "bg-dark-grey" : "bg-grey"
              }`}
            >
              temps restant
            </div>
            <div
              onClick={() => setSortMode("list")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                sortMode === "list" ? "bg-dark-grey" : "bg-grey"
              }`}
            >
              liste
            </div>
          </div>
        </div>
      </div>

      {/* Filtres type & status */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">Liste des filtres</p>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isChecked = filteredTypes.includes(type)
            return (
              <div
                key={type}
                onClick={() => toggleType(type)}
                className={`flex bg-grey items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                  isChecked ? "!bg-dark-grey" : ""
                }`}
              >
                <span>type : {type.toLowerCase()}</span>
              </div>
            )
          })}

            {reserved.map((r) => {
            const isChecked = filteredReserved.includes(r)
            return (
              <div
                key={r}
                onClick={() => toggleReserved(r)}
                className={`flex bg-grey items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                  isChecked ? "!bg-dark-grey" : ""
                }`}
              >
                <span>type : {r.toLowerCase()}</span>
              </div>
            )
          })}

          {statuses.map((status) => {
            const isChecked = filteredStatuses.includes(status)
            return (
              <div
                key={status}
                onClick={() => toggleStatus(status)}
                className={`flex bg-grey items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                  isChecked ? "!bg-dark-grey" : ""
                }`}
              >
                <span>status : {status}</span>
              </div>
            )
          })}

        
        </div>
      </div>
    </div>
  )
}
