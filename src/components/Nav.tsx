import { Link, useLocation } from "react-router-dom"
import { Theater, User, Users, ScrollText, ChartNoAxesCombined, Settings, ChevronsLeftRight, ChevronsRightLeft, Unplug, MessageCircleQuestionMark } from "lucide-react"
import { buttonBase } from "../App"
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

export function Nav({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
    const location = useLocation()
    const { user, setUser } = useAuthStore()
    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const links = [
        { path: "/", label: "Gestion des salles", icon: <Theater className="w-5 h-5 stroke-1" /> },
        { path: "/utilisations", label: "Historique des entrées sorties", icon: <ScrollText className="w-5 h-5 stroke-1" /> },
        { path: "/utilisateurs", label: "Gestion des utilisateurs", icon: <Users className="w-5 h-5 stroke-1" /> },
        { path: "/statistiques", label: "Statistiques", icon: <ChartNoAxesCombined className="w-5 h-5 stroke-1" /> },

    ]

    const links2 = [
        { path: "/parametres", label: "Paramètres", icon: <Settings className="w-5 h-5 stroke-1" /> },
        { path: "/support", label: "Contacter le support", icon: <MessageCircleQuestionMark className="w-5 h-5 stroke-1" /> },
    ]

    return (
        <div
            className={`fixed p-4 top-0 left-0 h-full bg-white border-r border-grey z-20 transition-all duration-300 flex flex-col justify-between
      ${open ? "w-76" : "w-auto"}`}
        >
            <div className="flex flex-col gap-4">
                {/* Bouton toggle */}
                 <div className="flex justify-start">
                <button
                    onClick={() => setOpen(!open)}
                    className={`${buttonBase} !p-4 !w-auto`}
                >
                    {open ? <ChevronsRightLeft className="w-5 h-5 stroke-1" /> : <ChevronsLeftRight className="w-5 h-5 stroke-1" />}
                </button>
                </div>
                <hr className="border-grey" />
                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {links.map((link) => {
                        const active = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer overflow-hidden
                ${active ? "bg-black text-white" : "hover:bg-grey"}
              `}
                            >
                                {link.icon}
                                {open && <span className="text-sm">{link.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex flex-col gap-4">
                <nav className="flex flex-col gap-2">
                    {links2.map((link) => {
                        const active = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer overflow-hidden
                ${active ? "bg-black text-white" : "hover:bg-grey"}
              `}
                            >
                                {link.icon}
                                {open && <span className="text-sm">{link.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
                <hr className="border-grey" />
                {user && (
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center justify-center p-4 rounded-full bg-purple-transparent text-purple">
                            <User className="w-5 h-5 stroke-1" />
                           
                        </div>
                        {open && (
                            <div className="flex flex-col items-center text-sm gap-2">
                                <span className="">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className={`${buttonBase}`}
                                >
                                    <Unplug className="w-4 h-4 stroke-1" />
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
