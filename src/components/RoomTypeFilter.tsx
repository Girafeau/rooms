import { useFilterStore } from "../store/useFilterStore"
import { statuses, statusLabels, types } from "../types/Room"
import { buttonBase, inputBase } from "../App"
import { X } from "lucide-react"
import { useState } from "react"

export function RoomTypeFilter() {
  const { filteredTypes, filteredStatuses, filteredRoomsNumber, toggleType, toggleStatus, toggleNumber, setSortMode, sortMode } = useFilterStore()
  const [number, setNumber] = useState("")
  return (
    <div className="flex flex-col gap-2">

      <form
        className="flex flex-col gap-2 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          toggleNumber(number)
          setNumber("")
        }}
      >
        <p className="text-sm">Numéro</p>
        <input
          type="text"
          placeholder=""
          className={`${inputBase}`}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </form>
      <p className="text-sm">Status</p>
      <div className="flex gap-2">
        {statuses.map((status) => {
          const isChecked = filteredStatuses.includes(status)
          const displayLabel = statusLabels[status] || status

          return (
            <div
              key={status}
              className={`flex items-center gap-2 border transition text-sm ${buttonBase} !w-auto
      ${isChecked ? " !bg-dark-grey" : ""}`}
              onClick={() => toggleStatus(status)}
            >
              <span>{displayLabel}</span>
            </div>
          )
        })}
      </div>
      <p className="text-sm">Type</p>
      <div className="flex gap-2">

        {types.map((type) => {
          const isChecked = filteredTypes.includes(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`flex items-center gap-2 border transition text-sm ${buttonBase} !w-auto
              ${isChecked ? " !bg-dark-grey" : ""}
              `}
            >
              <span>{type.toLowerCase()}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm mt-2">Liste des modes d'affichage : </p>
          <div className="flex gap-2">
            <div
              onClick={() => setSortMode("floor")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-2 px-4 ${sortMode === "floor" ? "bg-dark-grey" : "bg-grey"}`}
            >
              tri : étage décroissant
            </div>
            <div
              onClick={() => setSortMode("time")}
              className={`flex items-center cursor-pointer text-sm rounded-full py-2 px-4 ${sortMode === "time" ? "bg-dark-grey" : "bg-grey"}`}
            >
              tri : temps restant
            </div>
          </div>
        </div>
        {(filteredTypes.length > 0 || filteredStatuses.length > 0 || filteredRoomsNumber.length > 0) && (<div className="flex flex-col gap-2">

          <p className="text-sm mt-2">Liste des filtres : </p>
          <div className="flex gap-2" >
            {filteredTypes.map((type) => {
              return (
                <div key={type} className="flex bg-grey items-center cursor-pointer text-sm rounded-full py-2 px-4" onClick={() => toggleType(type)}><span>type : {type.toLowerCase()}</span>
                  <X className="w-3 h-3 stroke-2 ml-2" />
                </div>
              )
            })}
            {filteredStatuses.map((status) => {
              return (
                <div key={status} className="flex  bg-grey items-center cursor-pointer text-sm rounded-full py-2 px-4" onClick={() => toggleStatus(status)}><span>status : {status}</span>
                  <X className="w-3 h-3 stroke-2 ml-2" />
                </div>
              )
            })}

            {filteredRoomsNumber.map((number) => {
              return (
                <div key={number} className="flex  bg-grey items-center cursor-pointer text-sm rounded-full py-2 px-4" onClick={() => toggleNumber(number)}><span>numéro : {number}</span>
                  <X className="w-3 h-3 stroke-2 ml-2" />
                </div>
              )
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
