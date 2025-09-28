import type { ReactNode } from "react";

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <header className="bg-white border-b border-grey flex flex-col gap-1">
      <h1 className="text-4xl font-bold font-title">{children}</h1>
      {subtitle && <p className="text-sm text-dark-grey">{subtitle}</p>}
    </header>
  )
}
