import { UniversityIcon } from "lucide-react"
import { SquareArrowRightExit } from "lucide-react"
import { UserIcon } from "lucide-react"
import { PaperclipIcon } from "lucide-react"
import "./Header.css"
import { useNavigate } from "react-router-dom"

export const Header = () => {
    const navigate = useNavigate()

    return (
        <nav className="header px-8 text-white bg-black flex justify-between items-stretch">
            <h2 className=" text-white inline">
                <UniversityIcon className="inline"/> Portal Universitario
            </h2>
            <div className="flex items-stretch">
                <a className="p-2 navButton" onClick={(e) => (navigate("/solicitudes"))}> <PaperclipIcon className="inline"/> Mis Solicitudes</a>
                <a className="p-2 navButton" onClick={(e) => (navigate("/perfil"))}> <UserIcon className="inline"/> Perfil</a>
                <a className="p-2 navButton" onClick={(e) => (navigate("/salir"))}> <SquareArrowRightExit className="inline"/> Salir</a>
            </div>
        </nav>
    )
}