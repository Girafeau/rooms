import { Check } from "lucide-react"

type Props = {
  label: string
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function IconCheckbox({ label, checked = false, disabled = false, onChange }: Props) {
  const toggle = () => {
    if (disabled) return
    onChange?.(!checked)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`w-4 h-4 flex items-center justify-center border border-black ${
          checked ? "bg-black text-white" : "bg-white text-transparent"
        }`}
      >
        <Check className="w-3 h-3" strokeWidth={2} />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </button>
  )
}
