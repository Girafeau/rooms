import { Menu, X } from "lucide-react"
import { buttonBase } from "../App"
import { useState } from "react"
import { Link } from "react-router-dom"

export function Nav() {
    const [open, setOpen] = useState(true)
    const links = [
        { name: "Maison", path: "/", label: "Gestion des salles." },
        { name: "Maison", path: "/utilisations", label: "Gestion des utilisations." },
        { name: "Liste", path: "/acces", label: "Gestion des accès utilisateurs." },
    ]

    return (
        <div className="relative">
            {/* Bouton pour ouvrir/fermer */}
            <div className="relative">
                <button
                    onClick={() => setOpen((s) => !s)}
                    className={`${buttonBase} !p-4`}
                >
                    {open ? <X className="w-5 h-5 stroke-1" /> : <Menu className="w-5 h-5 stroke-1" />}
                </button>
            </div>

            {/* Panneau */}
            {open && (
                <div className="absolute top-20 left-0 p-4 bg-white z-10 flex flex-col gap-3 ">
                    <nav className="flex flex-col gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={buttonBase}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    )
}
