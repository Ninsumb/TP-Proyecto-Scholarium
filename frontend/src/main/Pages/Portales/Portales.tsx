import { PortalCard } from "../../Components/PortalCard"

export const Portales = () => {
    return (
        <div className="portalesView mx-30">
            <h1 className="font-bold">Explorar Portales Universitarios</h1>
            
            <p>Busca y solicita acceso a diferentes portales de carreras</p>

            <p className="flex">
                <input className="w-100 border p-1 grow" placeholder="Buscar por nombre o descripcion..."/>
            </p>

            <div className="portalesGrid grid grid-cols-3">
                <PortalCard nombre="Ingenieria Informatica" descripcion="Sistemas, programacion y desarrollo de software" numeroEstudiantes={1250}/>
                <PortalCard nombre="Administracion de Empresas" descripcion="Gestion, finanzas y desarrollo organizacional" numeroEstudiantes={980}/>
                <PortalCard nombre="Ingenieria Quimica" descripcion="Procesos quimicos y desarrollo industrial" numeroEstudiantes={850}/>
            </div>
        </div>
    )
}