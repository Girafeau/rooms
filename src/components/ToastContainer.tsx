// src/components/ToastContainer.tsx
import { useToastStore } from "../store/useToastStore"
import { X } from "lucide-react"

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black text-white p-4 shadow-lg flex items-center justify-between w-90 animate-slide-up"
        >
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)}>
            <X className="w-4 h-4 text-white opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  )
}
