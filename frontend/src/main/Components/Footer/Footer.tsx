import { GraduationCap, Mail } from "lucide-react"
import { FaInstagram, FaPaypal } from "react-icons/fa"
import { useState } from "react"

export const Footer = () => {
const [showEmail, setShowEmail] = useState(false);

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

                        <button
                            onClick={() => setShowEmail((v) => !v)}
                            className="flex items-center gap-1 hover:opacity-80 transition"
                        >
                            <Mail className="w-4 h-4" />

                            {showEmail
                                ? "scholarium.dev@gmail.com"
                                : "Contacto"}
                        </button>

                        <a
                            href="https://www.instagram.com/scholarium.dev/"
                            className="flex items-center gap-1 hover:opacity-80 transition"
                        >
                            <FaInstagram className="w-4 h-4" />
                            Instagram
                        </a>

                        <a
                            href="https://paypal.me/scholarium"
                            className="inline-flex items-center gap-2 bg-amber-300 text-primary px-3 py-1 rounded-2xl font-medium hover:opacity-90 transition"
                        >
                            <FaPaypal className="w-4 h-4" />
                            Donar al proyecto
                        </a>

                    </div>
                </div>
            </div>
        </footer>
    )
}