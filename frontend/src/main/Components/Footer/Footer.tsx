import { GraduationCap } from "lucide-react"
import { Mail } from "lucide-react"
import { Globe } from "lucide-react"

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex">
                    <div>
                        <GraduationCap className="w-16 h-16 text-primary-foreground px-2"/>
                    </div>
                    <div>
                        <h1 className="text-primary-foreground">Scholarium</h1>
                        <p>Foro universitario cooperativo</p>
                    </div>
                </div>
                <hr />
                <div className="flex p-2">
                <p>© Copyright {new Date().getFullYear()}, todos los derechos reservados.</p>
                <p className="grow"></p>
                <p>
                    <a href="https://www.youtube.com/watch?v=WTLrPLff7Fo" className="px-3 py-1"><Mail className="inline p-1"/> Contacto</a>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="px-3 py-1"><Globe className="inline p-1"/> Instagram</a>
                    <a href="https://www.youtube.com/watch?v=oavMtUWDBTM" className="bg-amber-300 text-primary p-1 rounded-2xl">☕ Donar al proyecto</a>
                </p>
                </div>
            </div>
        </footer>
    )
}