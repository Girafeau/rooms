import { useEffect } from "react"

type Props = {
  message: string
  onClose: () => void
  duration?: number // durée en ms
}

export function Toast({ message, onClose, duration = 3000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="p-4 bg-grey animate-slide-in animate-fade-in">
      {message}
    </div>
  )
}
