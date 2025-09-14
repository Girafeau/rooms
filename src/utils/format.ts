export default function formatHHMM(ms: number | null): string | null {
    if (ms === null) return null
    const totalSeconds = Math.floor(ms / 1000)
    const sign = totalSeconds < 0 ? "-" : ""
    const absSeconds = Math.abs(totalSeconds)
    const hours = Math.floor(absSeconds / 3600)
    const minutes = Math.floor((absSeconds % 3600) / 60)
    const seconds = absSeconds % 60
    return `${sign}${hours.toString().padStart(2,"0")}:${minutes
      .toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  }
  