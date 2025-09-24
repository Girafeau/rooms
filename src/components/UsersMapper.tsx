import { useState } from "react"
import { buttonBase } from "../App"

interface Mapping {
  eleveId: string
  personneId: string
  nomPrenom: string
}

export default function UsersMapper() {
  const [cookies, setCookies] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [lastRequest, setLastRequest] = useState<string | null>(null)

  const fetchEleves = async () => {
    setLoading(true)
    setError(null)
    setMappings([])

    try {
      const baseUrl =
        "https://www.imuse-grandnancy.fr//eleves/eleve.php?&exercice_scolaire_id=20&tri1=ELEVE_NUMERO-ASC&numl=0&tree_mode=normal&page=1&search="

      setLastRequest(`URL: ${baseUrl}\nCookies: ${cookies}`)

      const res = await fetch(baseUrl, {
        headers: { Cookie: cookies },
        credentials: "include",
      })
      const html = await res.text()

      // Extraire ELEVE_ID + PERSONNE_NOM_PRENOM
      const eleves = Array.from(
        html.matchAll(/"ELEVE_ID":"(\d+)".+?"PERSONNE_NOM_PRENOM":"(.*?)"/gs)
      ).map((m) => ({
        eleveId: m[1],
        nomPrenom: m[2],
      }))

      const detailUrlBase =
        "https://www.imuse-grandnancy.fr//eleves/eleve.php?&type_eleves=TOUS&eleves_des_familles=false&exercice_scolaire_id=20&id="

      const results: Mapping[] = []
      for (const eleve of eleves) {
        try {
          const detailUrl = `${detailUrlBase}${eleve.eleveId}&numl=0&first_num=0&search=&page=1&tri1=ELEVE_NUMERO-ASC`
          setLastRequest(`URL: ${detailUrl}\nCookies: ${cookies}`)

          const detailRes = await fetch(detailUrl, {
            headers: { Cookie: cookies },
            credentials: "include",
          })
          const detailHtml = await detailRes.text()

          const match = detailHtml.match(
            /<div id="label_personne_id" value="#(\d+)"[^>]*>#\d+<\/div>/
          )
          if (match) {
            results.push({
              eleveId: eleve.eleveId,
              personneId: match[1],
              nomPrenom: eleve.nomPrenom,
            })
          }
        } catch (err) {
          console.error("Erreur élève", eleve.eleveId, err)
        }
      }

      setMappings(results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <h2 className="text-lg font-semibold">Mapper élèves → personne</h2>

      <input
        type="text"
        placeholder="Colle ici tes cookies"
        value={cookies}
        onChange={(e) => setCookies(e.target.value)}
        className="w-full border p-2 rounded text-sm"
      />

      <button
        onClick={fetchEleves}
        disabled={loading || !cookies}
         className={`${buttonBase}`}
      >
        {loading ? "⏳ Chargement..." : "📥 Charger"}
      </button>

      {lastRequest && (
        <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {lastRequest}
        </pre>
      )}

      {error && <p className="text-red-600">❌ Erreur : {error}</p>}

      {mappings.length > 0 && (
        <ul className="text-sm space-y-1">
          {mappings.map((m) => (
            <li key={m.eleveId}>
              {m.nomPrenom} (Élève {m.eleveId}) → Personne {m.personneId}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
