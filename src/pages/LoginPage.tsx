// src/pages/LoginPage.tsx
import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import { buttonBase, inputBase } from "../App"
import { useNavigate } from "react-router-dom"

export function LoginPage() {
    const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signIn(email, password)
    if (error) {
      alert("Échec de la connexion : " + error.message)
    } else {
      navigate("/") // rediriger vers la page principale après connexion réussie
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
        <h1 className="text-xl font-bold mb-4"></h1>
        <input
          type="email"
          className={`${inputBase}`}
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className={`${inputBase}`}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className={`${buttonBase}`}
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}
