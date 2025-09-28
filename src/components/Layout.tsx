// src/components/Layout.tsx
import { useState } from "react"
import { Nav } from "./Nav"

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex">
      <Nav open={open} setOpen={setOpen} />
      <main
        className={`transition-all duration-300 flex-1 p-6 ${
          open ? "ml-76" : "ml-16"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
