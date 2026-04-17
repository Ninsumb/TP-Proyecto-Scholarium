import { Code } from "lucide-react"

interface PortalCardProps{
    nombre: string,
    descripcion: string,
    numeroEstudiantes: number
}

export const PortalCard = (props: PortalCardProps) => {
    return (
        <div className="portalCard border m-1 p-2">
            <div className="flex">
                <div>
                    <div className="bg-[#F00] p-2 m-2 border">
                        <Code/>
                    </div>
                </div>
                <div>
                    <h2 className="font-semibold">{props.nombre}</h2>
                    <p>{props.descripcion}</p>
                    <p>{props.numeroEstudiantes} estudiantes</p>
                </div>
            </div>
            <div className="block text-center">
                <button className="text-center m-2 w-full">Ir al portal</button>
            </div>
        </div>
    )
}