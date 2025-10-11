import { useFilterStore } from "../store/useFilterStore"
import { statuses, types, reserved, statusLabels } from "../types/Room"
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
    roomSearch,
    nameSearch,
  } = useFilterStore()

  // 🧮 Compte le nombre total de filtres actifs
  const activeFilterCount =
    filteredTypes.length + filteredStatuses.length + filteredReserved.length

  return (
    <div className="flex flex-col gap-2">
      {/* Recherche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche par numéro de salle */}
        <div className="flex flex-col gap-2">
          <p className="text-sm">Recherche par numéro de salle</p>
          <input
            type="text"
            placeholder="ex : 432"
            className={`${inputBase} text-sm`}
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
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
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>

        {/* Modes d’affichage */}
        <div className="flex flex-col gap-2">
          <p className="text-sm">Liste des affichages</p>
          <div className="flex gap-2 flex-wrap">
            <div
              onClick={() => setSortMode("floor")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                sortMode === "floor" ? "bg-black text-white" : "bg-grey"
              }`}
            >
             mode : étage décroissant
            </div>
            <div
              onClick={() => setSortMode("time")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 ${
                sortMode === "time" ? "bg-black text-white" : "bg-grey"
              }`}
            >
              mode : temps restant
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm">Liste des filtres</p>

         {/* 🟢 Pastille du nombre de filtres actifs */}
          {activeFilterCount > 0 && (
            <span className="bg-red-light text-red text-xs rounded-full px-1 flex items-center justify-center w-6 h-6">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Types */}
          {types.map((type) => {
            const isChecked = filteredTypes.includes(type)
            return (
              <div
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 bg-grey ${
                  isChecked ? "!bg-black text-white" : ""
                }`}
              >
                <span>type : {type.toLowerCase()}</span>
              </div>
            )
          })}

          {/* Reserved */}
          {reserved.map((r) => {
            const isChecked = filteredReserved.includes(r)
            return (
              <div
                key={r}
                onClick={() => toggleReserved(r)}
                className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 bg-grey ${
                  isChecked ? "!bg-black text-white" : ""
                }`}
              >
                <span>type : {r.toLowerCase()}</span>
              </div>
            )
          })}

          {/* Statuts */}
          {statuses.map((status) => {
            const isChecked = filteredStatuses.includes(status)
            return (
              <div
                key={status}
                onClick={() => toggleStatus(status)}
                className={`flex items-center cursor-pointer text-sm rounded-full py-3 px-4 bg-grey ${
                  isChecked ? "!bg-black text-white" : ""
                }`}
              >
                <span>status : {statusLabels[status].toLowerCase()}</span>
              </div>
            )
          })}
        </div>
         
      </div>
    </div>
  )
}
