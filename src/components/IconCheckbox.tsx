import { Check } from "lucide-react"
import { useState } from "react"

type Props = {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function IconCheckbox({ label, checked: defaultChecked = true, onChange }: Props) {
  const [checked, setChecked] = useState(defaultChecked)

  const toggle = () => {
    const newValue = !checked
    setChecked(newValue)
    onChange?.(newValue)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <div
        className={`w-4 h-4 flex items-center justify-center border border-black ${
          checked ? "" : "text-transparent bg-white"
        }`}
      >
        <Check className="w-3 h-3" strokeWidth={2} />
      </div>
      {label &&
      <span className="text-sm">{label}</span>
      }
    </button>
  )
}
