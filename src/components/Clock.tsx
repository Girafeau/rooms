import { useEffect, useState } from "react"

export default function Clock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return (
    <div className="text-lg font-semi-bold items-center justify-center">
      {formatTime(time)}
    </div>
  )
}
