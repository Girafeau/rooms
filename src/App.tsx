import { Routes, Route, useLocation, BrowserRouter } from "react-router-dom"
import RoomsPage from "./pages/RoomsPage"
import { LatestUsesPage } from "./pages/LatestUsesPage"
import DisplayPage from "./pages/DisplayPage"
import { useAuthStore } from "./store/authStore"
import { useEffect } from "react"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LoginPage } from "./pages/LoginPage"
import AccessAndBanPage from "./pages/AccessAndBanPage"
import { Layout } from "./components/Layout"
import { SettingsPage } from "./pages/SettingsPage"
import { SupportPage } from "./pages/SupportPage"
import { StatsPage } from "./pages/StatsPage"
import BarCodeListener from "./components/BarCodeListener"

export const buttonBase = "rounded-xl  w-full flex items-center justify-center gap-2 px-4 py-3 transition-colors bg-grey  hover:bg-dark-grey disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
export const inputBase = "rounded-xl bg-grey px-4 py-3 w-full focus:border-dark-grey focus:outline focus:outline-dark-grey focus:invalid:border-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

function Page({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isDisplay = location.pathname === "/consulter"
  return (
    <Layout>
      {!isDisplay && (
        <header className="flex items-center gap-4 justify-between">
           <div className="flex items-center gap-4 fixed top-4 left-4 z-10">
          </div>
          <div className="flex items-center gap-4 fixed top-4 right-4 z-10">
           
          </div>
        </header>
      )}
      <BarCodeListener />
      <main>{children}</main>
    </Layout>
  )
}

export default function App() {
  const initSession = useAuthStore((s) => s.initSession)

  useEffect(() => {
    initSession()
  }, [initSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<LoginPage />} />
        <Route element={<Page><ProtectedRoute /></Page>}>
          <Route path="/" element={<RoomsPage />} />
          <Route path="/utilisateurs" element={<AccessAndBanPage />} />
          <Route path="/utilisations" element={<LatestUsesPage />} />
          <Route path="/parametres" element={<SettingsPage />} />
           <Route path="/support" element={<SupportPage />} />
          <Route path="/statistiques" element={<StatsPage />} />
        </Route>
        <Route path="/consulter" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  )
}

