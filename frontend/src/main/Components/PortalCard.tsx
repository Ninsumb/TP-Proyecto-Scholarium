import { Code } from "lucide-react"

interface PortalCardProps{
    nombre: string,
    descripcion: string,
    numeroEstudiantes: number
}

export const PortalCard = (props: PortalCardProps) => {
    return (
        <div className="portalCard border m-1 p-2 flex flex-col">
            <div className="flex grow">
                <div>
                    <div className="bg-[#F00] p-2 m-2 border">
                        <Code/>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                    <h2 className="font-semibold grow">{props.nombre}</h2>
                    <div className="">
                        <p>{props.descripcion}</p>
                        <p>{props.numeroEstudiantes} estudiantes</p>
                    </div>
                </div>
            </div>
            <div className="block text-center">
                <button className="text-center w-full">Ir al portal</button>
            </div>
        </div>
    )
}