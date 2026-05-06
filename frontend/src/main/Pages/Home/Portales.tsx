import { PortalCard } from "../../Components/PortalCard"
import { useOnInit } from "../../hooks/useOnInit"
import { portalesService } from "../../services/PortalesService"
import { Search } from "lucide-react"
import { UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Home = () => {
    const navigate = useNavigate()

    useOnInit(async () => {
        portalesService.getAll()
    })

    return (
        <div className="portalesView mx-30">
            <h1 className="font-bold">Bienvenido, Usuario</h1>
            
            <p>Selecciona un portal de carrera para acceder a materiales, foros y recursos academicos</p>

            <p>
                <button className="m-2" onClick={()=>{}}><Search className="inline"/> Explorar portales universitarios</button>
                <button className="m-2" onClick={()=>{navigate("/nuevo-portal")}}><UserPlus className="inline"/> Crear nuevo portal</button>
            </p>
            

            <h2>Mis Portales</h2>

            <div className="portalesGrid grid grid-cols-3">
                <PortalCard nombre="Ingenieria Informatica" descripcion="Sistemas, programacion y desarrollo de software" numeroEstudiantes={1250}/>
                <PortalCard nombre="Administracion de Empresas" descripcion="Gestion, finanzas y desarrollo organizacional" numeroEstudiantes={980}/>
                <PortalCard nombre="Ingenieria Quimica" descripcion="Procesos quimicos y desarrollo industrial" numeroEstudiantes={850}/>
            </div>
        </div>
    )
}