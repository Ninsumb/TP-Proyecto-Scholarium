import { Code } from "lucide-react"
import type { PortalCardProps } from "../types/Portal"



export const PortalCard = ({portal}: PortalCardProps) => {
    return (
        <div className="portalCard border m-1 p-2 flex flex-col">
            <div className="flex grow">
                <div>
                    <div className="bg-[#F00] p-2 m-2 border">
                        <Code/>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                    <h2 className="font-semibold grow">{portal.nombre}</h2>
                    <div className="">
                        <p>{portal.descripcion}</p>
                        <p>{portal.numeroEstudiantes} estudiantes</p>
                    </div>
                </div>
            </div>
            <div className="block text-center">
                <button className="text-center w-full">Ir al portal</button>
            </div>
        </div>
    )
}