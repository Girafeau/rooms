import { useState } from "react"

export default function UsersMapper() {
  const [cookies, setCookies] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(
        "https://<YOUR-PROJECT-REF>.functions.supabase.co/fetch-imuse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            cookies,
          }),
        }
      )

      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || "Erreur inconnue")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md max-w-xl">
      <h2 className="text-lg font-semibold">IMUSE Fetcher</h2>

      <input
        type="text"
        placeholder="Cookies"
        value={cookies}
        onChange={(e) => setCookies(e.target.value)}
        className="border rounded p-2 text-sm"
      />

      <input
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded p-2 text-sm"
      />

      <button
        onClick={handleFetch}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Chargement..." : "Charger"}
      </button>

      {error && <p className="text-red-500 text-sm">❌ {error}</p>}

      {result && (
        <pre className="bg-gray-100 p-2 rounded text-xs max-h-80 overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
