import type { ReactNode } from "react"
import { inputBase } from "../App"

type Props = {
  icon: ReactNode
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  iconPosition?: "left" | "right"
}

export function InputWithIcon({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  iconPosition = "left",
}: Props) {
  return (
    <div className="relative w-full">
      {iconPosition === "left" && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${inputBase} ${
          iconPosition === "left" ? "pl-10" : "pr-10"
        }`}
      />

      {iconPosition === "right" && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  )
}
