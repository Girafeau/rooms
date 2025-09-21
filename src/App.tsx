import { Routes, Route, Link, useLocation, BrowserRouter } from "react-router-dom"
import RoomsPage from "./pages/RoomsPage"
import { Guitar, ListOrdered } from "lucide-react"
import { LatestUsesPage } from "./pages/LatestUsesPage"
import DisplayPage from "./pages/DisplayPage"
import { useAuthStore } from "./store/authStore"
import { useEffect } from "react"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LoginPage } from "./pages/LoginPage"
import { Settings } from "./components/Settings"
import VoiceAssistant from "./components/VoiceAssistant"
import { useSettingsStore } from "./store/useSettingsStore"

export const buttonBase = "rounded w-full flex items-center justify-center gap-2 px-4 py-2 transition-colors bg-grey border-1 border-dark-grey hover:bg-dark-grey disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
export const inputBase = "rounded bg-grey px-4 py-2 w-full border-1 border-dark-grey focus:border-dark-grey focus:outline focus:outline-dark-grey focus:invalid:border-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { showVoiceAssitant } = useSettingsStore();
  const isDisplay = location.pathname === "/consulter"
  return (
    <div>
      {!isDisplay && (
        <header className="flex items-center gap-4 justify-between p-4">
          <Nav />
          <div className="flex gap-4 fixed top-4 right-4 z-10">
            {showVoiceAssitant && (
              <VoiceAssistant />)}
            <Settings />
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
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
        <Route element={<Layout><ProtectedRoute /></Layout>}>
          <Route path="/" element={<RoomsPage />} />
          <Route path="/liste" element={<LatestUsesPage />} />
        </Route>
        <Route path="/consulter" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function Nav() {
  const links = [
    { name: "Maison", path: "/", icon: <Guitar strokeWidth={1} /> },
    { name: "Liste", path: "/liste", icon: <ListOrdered strokeWidth={1} /> },
  ]

  return (
    <nav className="flex gap-4">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={buttonBase}
        >
          {link.icon}
        </Link>
      ))}
    </nav>
  )
}

