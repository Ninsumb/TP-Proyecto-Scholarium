import { GraduationCap, Mail, Globe } from "lucide-react"

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

                {/* Parte superior */}
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-14 h-14 shrink-0" />

                    <div>
                        <h1 className="text-xl font-semibold text-primary-foreground">
                            Scholarium
                        </h1>

                        <p className="text-sm opacity-90">
                            Foro universitario cooperativo
                        </p>
                    </div>
                </div>

                <hr className="my-4 border-primary-foreground/20" />

                {/* Parte inferior */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <p className="text-sm opacity-90">
                        © Copyright {new Date().getFullYear()}, todos los derechos reservados.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">

                        <a
                            href="https://www.youtube.com/watch?v=WTLrPLff7Fo"
                            className="flex items-center gap-1 hover:opacity-80 transition"
                        >
                            <Mail className="w-4 h-4" />
                            Contacto
                        </a>

                        <a
                            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="flex items-center gap-1 hover:opacity-80 transition"
                        >
                            <Globe className="w-4 h-4" />
                            Instagram
                        </a>

                        <a
                            href="https://www.youtube.com/watch?v=oavMtUWDBTM"
                            className="bg-amber-300 text-primary px-3 py-1 rounded-2xl font-medium hover:opacity-90 transition"
                        >
                            ☕ Donar al proyecto
                        </a>

                    </div>
                </div>
            </div>
        </footer>
    )
}