import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import RoomsPage from "./pages/RoomsPage"
import PriorityRoomsPage from "./pages/PriorityRoomsPage"
import { Bike, LampCeiling, ScanText, TextAlignStart } from "lucide-react"
import { Settings } from "./components/Settings"

const buttonBase = "w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold transition-colors bg-grey border-1 border-dark-grey hover:bg-dark-grey disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
         {/* Logo en haut */}
               <div className="flex p-4 justify-between items-center">
                <div className="flex">
                <div className="flex flex-col">
                <h1 className="text-3xl font-display align-self-center">roumiroum</h1>
                <p className="text-sm font-display">v0.1 alpha</p>
                </div>
                <img
                  src="src/assets/cat.png"
                  alt="Logo"
                  className="w-[60px] h-[60px] object-contain"
                />
                
                </div>
                  <Settings />
              </div>
        <Nav />

        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<RoomsPage />} />
            <Route path="/scan" element={<PriorityRoomsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Nav() {
  const links = [
    { name: "Maison", path: "/", icon: <LampCeiling strokeWidth={1} /> },
    { name: "Scan", path: "/scan", icon: <ScanText strokeWidth={1} /> },
    { name: "Partir", path: "/partir", icon: <Bike strokeWidth={1} /> },
    { name: "Liste", path: "/liste", icon: <TextAlignStart strokeWidth={1} /> },
  ]

  return (
    <nav className="p-4 flex gap-4">
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
