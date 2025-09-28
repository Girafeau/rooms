// src/components/Title.tsx
import { CornerUpLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { buttonBase } from "../App"

type Props = {
  children: React.ReactNode
  button: React.ReactNode
  back?: boolean          // 👉 true = bouton retour activé
  backTo?: string         // 👉 route spécifique (facultatif)
}

export function Title({ children, button, back = false, backTo }: Props) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1) // retour en arrière dans l’historique
    }
  }

  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 bg-white p-4 border-b border-grey justify-between">
      <h1 className="text-2xl font-title">{children}</h1>
      {back && (
        <div className="flex gap-2 items-center">
           {button}
        <button
          onClick={handleBack}
           className={`${buttonBase} !p-4 !w-auto`}
        >
          <CornerUpLeft className="w-5 h-5 stroke-1" />
        </button>
        </div>
      )}
    </div>
  )
}
