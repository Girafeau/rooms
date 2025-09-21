import { useFilterStore } from "../store/useFilterStore"
import { statuses, types } from "../types/Room"
import { inputBase } from "../App"
import { X } from "lucide-react"
import { useState } from "react"

export function RoomTypeFilter() {
  const { filteredTypes, filteredStatuses, filteredRoomsNumber, toggleType, toggleStatus, toggleNumber, setSortMode, sortMode } = useFilterStore()
  const [number, setNumber] = useState("")
  return (
    <div className="flex flex-col gap-2">
      {false && (
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault()
            toggleNumber(number)
            setNumber("")
          }}
        >
          <input
            type="text"
            placeholder="Rechercher un nom ou un numéro de salle"
            className={`${inputBase}`}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </form>
      )}
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Liste des modes d'affichage : </p>
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
        {true && (<div className="flex flex-col gap-2">

          <p className="text-sm">Liste des filtres : </p>
          <div className="flex gap-2" >
            {types.map((type) => {
              const isChecked = filteredTypes.includes(type)
              return (
                <div
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex  bg-grey items-center cursor-pointer text-sm rounded-full py-2 px-4
              ${isChecked ? " !bg-dark-grey" : ""}
              `}
                >
                  <span>type : {type.toLowerCase()}</span>
                </div>
              )
            })}
            {statuses.map((status) => {
              const isChecked = filteredStatuses.includes(status)
              return (
                <div
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`flex  bg-grey items-center cursor-pointer text-sm rounded-full py-2 px-4
              ${isChecked ? " !bg-dark-grey" : ""}
              `}
                >
                  <span>status : {status}</span>
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
