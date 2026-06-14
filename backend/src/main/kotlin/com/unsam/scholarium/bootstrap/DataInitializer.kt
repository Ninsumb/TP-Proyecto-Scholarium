package com.unsam.scholarium.bootstrap

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.unsam.scholarium.model.*
import com.unsam.scholarium.repository.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class DataInitializer {

    @Bean
    fun init(
        usuarioRepo: UsuarioRepository,
        portalRepo: PortalRepository,
        membresiaRepo: MembresiaRepository,
        solicitudRepo: SolicitudRepository,
        carpetaRepo: CarpetaRepository,
        materiaRepo: MateriaRepository,
        materialRepo: MaterialRepository,
        foroRepo: ForoRepository,
        etiquetaRepo: EtiquetaRepository,
        postRepo: PostRepository,
        plantillaRepo: PlantillaSolicitudRepository,
        bloqueoRepo: PortalBloqueoRepository,
        cloudinary: Cloudinary,
        passwordEncoder: PasswordEncoder
    ) = CommandLineRunner {

        if (usuarioRepo.count() == 0L) {

            fun subirFotoBootstrap(rutaRecurso: String, usuarioId: Long): String? {
                return try {
                    val inputStream = DataInitializer::class.java
                        .getResourceAsStream(rutaRecurso) ?: return null
                    val bytes = inputStream.readBytes()
                    val result = cloudinary.uploader().upload(
                        bytes,
                        ObjectUtils.asMap(
                            "folder", "scholarium/fotos-perfil",
                            "public_id", "usuario-$usuarioId",
                            "overwrite", true,
                            "resource_type", "image"
                        )
                    )
                    result["secure_url"].toString()
                } catch (e: Exception) {
                    println("⚠️ No se pudo subir foto para usuario $usuarioId: ${e.message}")
                    null
                }
            }

            // ── Usuarios ──────────────────────────────────────────────────
            val nuevoAdmin = usuarioRepo.save(
                Usuario(
                    nombre = "Admin",
                    email = "admin@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )

            val admin = usuarioRepo.save(
                Usuario(nombre = "Valentino", email = "test@test.com", password = passwordEncoder.encode("1234"))
            )
            admin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/test.jpg", admin.id!!)
            usuarioRepo.save(admin)

            val admin2 = usuarioRepo.save(
                Usuario(nombre = "Pepita", email = "pepi@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(admin2)

            val solicitante = usuarioRepo.save(
                Usuario(nombre = "Juan García", email = "juan@test.com", password = passwordEncoder.encode("1234"))
            )
            solicitante.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/juan.jpg", solicitante.id!!)
            usuarioRepo.save(solicitante)

            val noAdmin = usuarioRepo.save(
                Usuario(nombre = "Pedro López", email = "pedro@test.com", password = passwordEncoder.encode("1234"))
            )
            noAdmin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/pedro.jpg", noAdmin.id!!)
            usuarioRepo.save(noAdmin)

            val rechazado = usuarioRepo.save(
                Usuario(nombre = "María Fernández", email = "maria@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(rechazado)

            val bloqueado = usuarioRepo.save(
                Usuario(nombre = "Carlos Gomez", email = "carlos@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(bloqueado)

            val variasMembresias = usuarioRepo.save(
                Usuario(nombre = "Jose VariasMembresiasez", email = "jose@test.com", password = passwordEncoder.encode("1234"))
            )

            // Usuario visitante: no tiene membresía en ningún portal
            // Sirve para probar que en portales ABIERTOS puede ver contenido
            // y en portales CERRADOS solo ve la home
            val visitante = usuarioRepo.save(
                Usuario(nombre = "Laura Visitante", email = "laura@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(visitante)

            // ── Portales ──────────────────────────────────────────────────
            // ABIERTO: cualquier usuario logueado puede ver materias y foro sin ser miembro
            val portal = portalRepo.save(
                Portal(
                    universidad = "Universidad Nacional de San Martín",
                    carrera = "Tecnicatura en Programación Informática",
                    unidadAcademica = "Escuela de Ciencia y Tecnología",
                    descripcion = "Espacio para estudiantes de la Tecnicatura Universitaria en Programación Informática de la UNSAM. La carrera forma profesionales capaces de diseñar, desarrollar y mantener soluciones de software, participar en proyectos informáticos de mediana envergadura y adaptarse a las nuevas tecnologías. Aquí encontrarás materiales, recursos y discusiones sobre programación, algoritmos, bases de datos, redes, arquitectura de computadoras y desarrollo de software.",
                    iconoPortal = "Code",
                    colorPortal = "#2563EB",
                    tipoAcceso = TipoAcceso.ABIERTO,
                )
            )

            // ABIERTO: para probar con otro portal que también permite visitas
            val portalRedes = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Tecnicatura en Redes Informáticas",
                unidadAcademica = "Escuela de Ciencia y Tecnología",
                descripcion = "Portal de la Tecnicatura Universitaria en Redes Informáticas de la UNSAM. La carrera está orientada al diseño, instalación, administración y mantenimiento de redes de computadoras, formando profesionales capaces de implementar soluciones de comunicación, evaluar infraestructuras tecnológicas y colaborar en proyectos de redes y seguridad informática. Un espacio para compartir conocimientos sobre protocolos, conectividad, sistemas distribuidos y tecnologías de comunicación.",
                iconoPortal = "Network",
                colorPortal = "#7C3AED",
                tipoAcceso = TipoAcceso.ABIERTO,
            ))

            // CERRADO: los siguientes portales funcionan como antes
            val portalDatos = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Licenciatura en Ciencias de Datos",
                descripcion = "Comunidad de la Licenciatura en Ciencia de Datos de la UNSAM. La carrera combina matemática, estadística e informática para formar profesionales capaces de analizar grandes volúmenes de datos, construir modelos predictivos y desarrollar soluciones basadas en evidencia. Encontrarás materiales relacionados con programación, aprendizaje automático, estadística, visualización de datos e investigación aplicada.",
                iconoPortal = "BarChart2",
                colorPortal = "#059669",
                tipoAcceso = TipoAcceso.CERRADO,
            ))
            val portalEspacial = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Ingeniería Espacial",
                descripcion = "Sí, es ciencia de cohetes.",
                iconoPortal = "Rocket",
                colorPortal = "#DC2626",
                tipoAcceso = TipoAcceso.CERRADO,
            ))
            val portalAlimentos = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Ingeniería en Alimentos",
                descripcion = "Diseño y construcción de alimentos.",
                iconoPortal = "FlaskConical",
                colorPortal = "#D97706",
                tipoAcceso = TipoAcceso.CERRADO,
            ))
            val portalElectronica = portalRepo.save(Portal(
                universidad = "UTN",
                carrera = "Ingeniería Electrónica",
                descripcion = "xD.",
                iconoPortal = "Cpu",
                colorPortal = "#0891B2",
                tipoAcceso = TipoAcceso.CERRADO,
            ))
            val portalInformaticaUTN = portalRepo.save(Portal(
                universidad = "UTN",
                carrera = "Ingeniería Informática",
                descripcion = "Dijkstra y amigos.",
                iconoPortal = "Terminal",
                colorPortal = "#4F46E5",
                tipoAcceso = TipoAcceso.CERRADO,
            ))
            val portalUADE = portalRepo.save(Portal(
                universidad = "UADE",
                carrera = "Cualquier Carrera",
                descripcion = "Te vendemos el título.",
                iconoPortal = "GraduationCap",
                colorPortal = "#BE185D",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            // ── Membresías ────────────────────────────────────────────────
            membresiaRepo.save(Membresia(usuario = admin, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = admin2, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = nuevoAdmin, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = noAdmin, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portalRedes, rol = RolMembresia.ADMIN))
            /*membresiaRepo.save(Membresia(usuario = bloqueado, portal = portal, rol = RolMembresia.MIEMBRO))*/
            // laura@test.com no tiene membresía en ningún portal → sirve para probar acceso como visitante

            // ── PlantillaSolicitud ─────────────────────────────────────────
            plantillaRepo.save(
                PlantillaSolicitud(
                    portal = portal,
                    requisitos = "Para unirte al portal de Tecnicatura en Programación, " +
                            "por favor incluí tu nombre completo y en qué año de la carrera estás cursando. " +
                            "Si ya tenés experiencia previa en programación, ¡contanos un poco!",
                    abierta = true,
                )
            )
            listOf(portalRedes, portalDatos, portalEspacial, portalAlimentos, portalElectronica, portalInformaticaUTN, portalUADE).forEach { p ->
                plantillaRepo.save(PlantillaSolicitud(portal = p, abierta = true))
            }

            // ── Solicitudes ────────────────────────────────────────────────
            solicitudRepo.save(
                Solicitud(
                    usuario = solicitante,
                    portal = portal,
                    nombreCompleto = "Juan García",
                    descripcion = "Soy alumno regular de primer año. Quiero acceder a los materiales " +
                            "de Algoritmos y participar del foro para hacer consultas.",
                )
            )

            val solicitudRechazada = Solicitud(
                usuario = rechazado,
                portal = portal,
                nombreCompleto = "María Fernández",
                descripcion = "Quiero unirme para ver los apuntes.",
            )
            solicitudRechazada.estado = Estado.RECHAZADA
            solicitudRechazada.motivoRechazo =
                "No pudimos verificar que seas alumna regular de la carrera. " +
                        "Por favor reenvía la solicitud con más información sobre tu situación académica."
            solicitudRepo.save(solicitudRechazada)

            bloqueoRepo.save(
                PortalBloqueo(
                    portal = portal,
                    usuario = bloqueado,
                    motivo = "Comportamiento inapropiado en el foro. Bloqueado por los admins.",
                )
            )

            // ── Carpetas TPI ────────────────────────────────────────────────

            // Años
            val primerAnio = carpetaRepo.save(
                Carpeta(nombre = "Primer Año", portal = portal)
            )

            val segundoAnio = carpetaRepo.save(
                Carpeta(nombre = "Segundo Año", portal = portal)
            )

            val tercerAnio = carpetaRepo.save(
                Carpeta(nombre = "Tercer Año", portal = portal)
            )

            // Cuatrimestres
            val primerAnioC1 = carpetaRepo.save(
                Carpeta(
                    nombre = "Primer Cuatrimestre",
                    portal = portal,
                    carpetaPadre = primerAnio
                )
            )

            val primerAnioC2 = carpetaRepo.save(
                Carpeta(
                    nombre = "Segundo Cuatrimestre",
                    portal = portal,
                    carpetaPadre = primerAnio
                )
            )

            val segundoAnioC1 = carpetaRepo.save(
                Carpeta(
                    nombre = "Tercer Cuatrimestre",
                    portal = portal,
                    carpetaPadre = segundoAnio
                )
            )

            val segundoAnioC2 = carpetaRepo.save(
                Carpeta(
                    nombre = "Cuarto Cuatrimestre",
                    portal = portal,
                    carpetaPadre = segundoAnio
                )
            )

            val tercerAnioC1 = carpetaRepo.save(
                Carpeta(
                    nombre = "Quinto Cuatrimestre",
                    portal = portal,
                    carpetaPadre = tercerAnio
                )
            )

            val tercerAnioC2 = carpetaRepo.save(
                Carpeta(
                    nombre = "Sexto Cuatrimestre",
                    portal = portal,
                    carpetaPadre = tercerAnio
                )
            )


            // ── Materias TPI ────────────────────────────────────────────────

            // ===== PRIMER AÑO - 1° CUATRIMESTRE =====

            val matematicaI = materiaRepo.save(
                Materia(
                    nombre = "Matemática I",
                    descripcion = "Introducción al análisis matemático, álgebra y geometría aplicada a la informática. Incluye funciones, límites, derivadas, integrales, matrices, sistemas de ecuaciones y ecuaciones diferenciales con apoyo computacional.",
                    carpeta = primerAnioC1
                )
            )

            val laboratorioComputacionI = materiaRepo.save(
                Materia(
                    nombre = "Laboratorio de Computación I",
                    descripcion = "Primer acercamiento al uso de computadoras y herramientas informáticas. Se trabajan conceptos básicos de programación, resolución de problemas, planillas de cálculo y aplicaciones estadísticas.",
                    carpeta = primerAnioC1
                )
            )

            val electricidadMagnetismo = materiaRepo.save(
                Materia(
                    nombre = "Electricidad y Magnetismo",
                    descripcion = "Fundamentos de física orientados a sistemas informáticos y de comunicaciones. Abarca circuitos eléctricos, campos electromagnéticos, ondas, inducción y tecnologías de transmisión inalámbrica.",
                    carpeta = primerAnioC1
                )
            )


            // ===== PRIMER AÑO - 2° CUATRIMESTRE =====

            val laboratorioComputacionII = materiaRepo.save(
                Materia(
                    nombre = "Laboratorio de Computación II",
                    descripcion = "Profundización en programación y resolución de problemas mediante herramientas informáticas. Incluye sistemas operativos, redes, algoritmos numéricos y fundamentos de estadística aplicada.",
                    carpeta = primerAnioC2
                )
            )

            val sistemasProcesamientoDatos = materiaRepo.save(
                Materia(
                    nombre = "Sistemas de Procesamiento de Datos",
                    descripcion = "Estudio de la organización interna de las computadoras modernas. Se analizan procesadores, memoria, dispositivos de entrada y salida, software de base y arquitecturas de alto desempeño.",
                    carpeta = primerAnioC2
                )
            )

            val matematicaII = materiaRepo.save(
                Materia(
                    nombre = "Matemática II",
                    descripcion = "Curso orientado a lógica, teoría de conjuntos, combinatoria, álgebra y geometría analítica. Proporciona herramientas matemáticas fundamentales para la informática y el análisis formal.",
                    carpeta = primerAnioC2
                )
            )


            // ===== SEGUNDO AÑO - 1° CUATRIMESTRE =====

            val algoritmosI = materiaRepo.save(
                Materia(
                    nombre = "Algoritmos I",
                    descripcion = "Introducción al diseño, especificación y corrección de programas. Se estudian estructuras de datos básicas, tipos abstractos y procesamiento de secuencias mediante proyectos prácticos.",
                    carpeta = segundoAnioC1
                )
            )

            val matematicaIII = materiaRepo.save(
                Materia(
                    nombre = "Matemática III",
                    descripcion = "Matemática discreta aplicada a la informática. Incluye lógica formal, álgebra de Boole, teoría de grafos, redes, conteo, recurrencia y análisis de algoritmos.",
                    carpeta = segundoAnioC1
                )
            )

            val arquitecturaSO = materiaRepo.save(
                Materia(
                    nombre = "Conceptos de Arquitecturas y Sistemas Operativos",
                    descripcion = "Estudio de la relación entre el hardware y los sistemas operativos. Se trabajan procesos, administración de recursos, sistemas distribuidos y arquitecturas de computadoras.",
                    carpeta = segundoAnioC1
                )
            )


            // ===== SEGUNDO AÑO - 2° CUATRIMESTRE =====

            val algoritmosII = materiaRepo.save(
                Materia(
                    nombre = "Algoritmos II",
                    descripcion = "Profundización en estructuras de datos avanzadas y técnicas de diseño de algoritmos. Se estudian recursión, árboles, grafos, diccionarios y métodos formales de especificación.",
                    carpeta = segundoAnioC2
                )
            )

            val redesLocales = materiaRepo.save(
                Materia(
                    nombre = "Redes Locales",
                    descripcion = "Introducción a las redes informáticas de área local. Incluye topologías, protocolos, servidores, TCP/IP, administración de sistemas en red y fundamentos de seguridad.",
                    carpeta = segundoAnioC2
                )
            )

            val metodosNumericos = materiaRepo.save(
                Materia(
                    nombre = "Métodos Numéricos",
                    descripcion = "Herramientas matemáticas para la resolución computacional de problemas numéricos. Se estudian aproximación, interpolación, integración numérica, ecuaciones diferenciales y métodos iterativos.",
                    carpeta = segundoAnioC2
                )
            )


            // ===== TERCER AÑO - 1° CUATRIMESTRE =====

            val algoritmosIII = materiaRepo.save(
                Materia(
                    nombre = "Algoritmos III",
                    descripcion = "Desarrollo de aplicaciones distribuidas bajo el paradigma cliente-servidor. Se estudian sistemas distribuidos, comunicación entre procesos, transacciones, servicios de red y aplicaciones colaborativas.",
                    carpeta = tercerAnioC1
                )
            )

            val basesDatos = materiaRepo.save(
                Materia(
                    nombre = "Bases de Datos",
                    descripcion = "Diseño, implementación y optimización de bases de datos. Incluye modelos de datos, SQL, transacciones, concurrencia, recuperación y administración de sistemas gestores.",
                    carpeta = tercerAnioC1
                )
            )

            val seminarioConcurrente = materiaRepo.save(
                Materia(
                    nombre = "Seminario de Programación Concurrente, Paralela y Distribuida",
                    descripcion = "Introducción a la concurrencia y el paralelismo en sistemas informáticos. Se abordan sincronización, exclusión mutua, semáforos, monitores, scheduling y comunicación entre procesos.",
                    carpeta = tercerAnioC1
                )
            )


            // ===== TERCER AÑO - 2° CUATRIMESTRE =====

            val herramientasModernas = materiaRepo.save(
                Materia(
                    nombre = "Programación con Herramientas Modernas",
                    descripcion = "Desarrollo de aplicaciones web y distribuidas utilizando tecnologías modernas. Incluye interfaces web, acceso a bases de datos, programación segura y herramientas orientadas a Internet.",
                    carpeta = tercerAnioC2
                )
            )

            val proyectosSoftware = materiaRepo.save(
                Materia(
                    nombre = "Proyectos de Software",
                    descripcion = "Aplicación práctica de metodologías de desarrollo mediante proyectos integradores. Se trabajan análisis, diseño, planificación, implementación y gestión de proyectos de software.",
                    carpeta = tercerAnioC2
                )
            )

            val paradigmasProgramacion = materiaRepo.save(
                Materia(
                    nombre = "Paradigmas de Programación",
                    descripcion = "Estudio comparativo de distintos enfoques de programación, incluyendo paradigmas imperativo, orientado a objetos, funcional y lógico, junto con sus aplicaciones.",
                    carpeta = tercerAnioC2
                )
            )


            // ===== Carpetas TRI =====

            val primerAnioTRI = carpetaRepo.save(
                Carpeta(nombre = "Primer Año", portal = portalRedes)
            )

            val segundoAnioTRI = carpetaRepo.save(
                Carpeta(nombre = "Segundo Año", portal = portalRedes)
            )

            val tercerAnioTRI = carpetaRepo.save(
                Carpeta(nombre = "Tercer Año", portal = portalRedes)
            )

            val cuatrimestre1TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "1° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = primerAnioTRI
                )
            )

            val cuatrimestre2TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "2° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = primerAnioTRI
                )
            )

            val cuatrimestre3TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "3° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = segundoAnioTRI
                )
            )

            val cuatrimestre4TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "4° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = segundoAnioTRI
                )
            )

            val cuatrimestre5TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "5° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = tercerAnioTRI
                )
            )

            val cuatrimestre6TRI = carpetaRepo.save(
                Carpeta(
                    nombre = "6° Cuatrimestre",
                    portal = portalRedes,
                    carpetaPadre = tercerAnioTRI
                )
            )

            // ===== 1° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Matemática I",
                    descripcion = "Introducción al análisis matemático, álgebra y geometría aplicada a problemas informáticos y de comunicaciones.",
                    carpeta = cuatrimestre1TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Laboratorio de Computación I",
                    descripcion = "Primer acercamiento al uso de computadoras, herramientas informáticas, programación básica y resolución de problemas.",
                    carpeta = cuatrimestre1TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Electricidad y Magnetismo",
                    descripcion = "Fundamentos de física orientados a sistemas electrónicos, comunicaciones y transmisión de información.",
                    carpeta = cuatrimestre1TRI
                )
            )


            // ===== 2° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Laboratorio de Computación II",
                    descripcion = "Programación aplicada, sistemas operativos, redes y herramientas computacionales para la resolución de problemas.",
                    carpeta = cuatrimestre2TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Sistemas de Procesamiento de Datos",
                    descripcion = "Estudio de la arquitectura interna de las computadoras, procesadores, dispositivos de entrada y salida y software de base.",
                    carpeta = cuatrimestre2TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Matemática II",
                    descripcion = "Lógica, teoría de conjuntos, combinatoria, álgebra y geometría analítica como herramientas fundamentales para la informática.",
                    carpeta = cuatrimestre2TRI
                )
            )


            // ===== 3° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Algoritmos I",
                    descripcion = "Diseño, implementación y verificación de algoritmos, estructuras de datos y tratamiento de secuencias y archivos.",
                    carpeta = cuatrimestre3TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Conceptos de Arquitecturas y Sistemas Operativos",
                    descripcion = "Arquitectura de computadoras, administración de recursos y funcionamiento de sistemas operativos modernos.",
                    carpeta = cuatrimestre3TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Matemática III",
                    descripcion = "Matemática discreta, lógica formal, álgebra de Boole, teoría de grafos, redes y análisis de algoritmos.",
                    carpeta = cuatrimestre3TRI
                )
            )


            // ===== 4° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Redes de Información I",
                    descripcion = "Fundamentos de comunicaciones de datos, modelo OSI, protocolos, redes LAN y tecnologías de transmisión.",
                    carpeta = cuatrimestre4TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Redes Locales",
                    descripcion = "Diseño, instalación y administración de redes locales, topologías, servidores y protocolos de comunicación.",
                    carpeta = cuatrimestre4TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Proyecto I",
                    descripcion = "Proyecto integrador enfocado en infraestructura física de redes, cableado estructurado, direccionamiento y planificación.",
                    carpeta = cuatrimestre4TRI
                )
            )


            // ===== 5° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Redes de Información II",
                    descripcion = "Protocolos avanzados de red, transmisión de voz y datos, aplicaciones distribuidas y comunicaciones seguras.",
                    carpeta = cuatrimestre5TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Administración de Redes de Computadoras",
                    descripcion = "Configuración, monitoreo, seguridad y administración de infraestructuras de red y servicios asociados.",
                    carpeta = cuatrimestre5TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Proyecto II",
                    descripcion = "Continuación del proyecto integrador con foco en configuración lógica, ruteo y administración de dispositivos de red.",
                    carpeta = cuatrimestre5TRI
                )
            )


            // ===== 6° CUATRIMESTRE =====

            materiaRepo.save(
                Materia(
                    nombre = "Redes de Información III",
                    descripcion = "Aplicaciones distribuidas, middleware, sistemas cliente-servidor, seguridad, VPN y servicios de red avanzados.",
                    carpeta = cuatrimestre6TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Sistemas Avanzados de Comunicación",
                    descripcion = "Tecnologías avanzadas de transmisión de datos, QoS, redes de alta velocidad, servicios distribuidos y comunicaciones modernas.",
                    carpeta = cuatrimestre6TRI
                )
            )

            materiaRepo.save(
                Materia(
                    nombre = "Proyecto III",
                    descripcion = "Proyecto final orientado al diseño de redes WAN, selección de protocolos y planificación integral de comunicaciones.",
                    carpeta = cuatrimestre6TRI
                )
            )

            // ===== AÑOS =====

            val primerAnioDatos = carpetaRepo.save(
                Carpeta(
                    nombre = "Primer Año",
                    portal = portalDatos
                )
            )

            val segundoAnioDatos = carpetaRepo.save(
                Carpeta(
                    nombre = "Segundo Año",
                    portal = portalDatos
                )
            )

            val tercerAnioDatos = carpetaRepo.save(
                Carpeta(
                    nombre = "Tercer Año",
                    portal = portalDatos
                )
            )

            val cuartoAnioDatos = carpetaRepo.save(
                Carpeta(
                    nombre = "Cuarto Año",
                    portal = portalDatos
                )
            )


            // ===== CUATRIMESTRES =====

            val cuatrimestre1Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "1° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = primerAnioDatos
                )
            )

            val cuatrimestre2Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "2° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = primerAnioDatos
                )
            )

            val cuatrimestre3Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "3° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = segundoAnioDatos
                )
            )

            val cuatrimestre4Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "4° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = segundoAnioDatos
                )
            )

            val cuatrimestre5Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "5° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = tercerAnioDatos
                )
            )

            val cuatrimestre6Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "6° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = tercerAnioDatos
                )
            )

            val cuatrimestre7Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "7° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = cuartoAnioDatos
                )
            )

            val cuatrimestre8Datos = carpetaRepo.save(
                Carpeta(
                    nombre = "8° Cuatrimestre",
                    portal = portalDatos,
                    carpetaPadre = cuartoAnioDatos
                )
            )

            // ===== 1° CUATRIMESTRE =====

            val analisisI = materiaRepo.save(
                Materia(
                    nombre = "Análisis I",
                    descripcion = "Introducción al cálculo diferencial e integral de una variable. Estudia funciones, límites, continuidad, derivadas, integrales y ecuaciones diferenciales aplicadas a la resolución de problemas matemáticos y científicos.",
                    carpeta = cuatrimestre1Datos
                )
            )

            val introduccionCienciaDatos = materiaRepo.save(
                Materia(
                    nombre = "Introducción a la Ciencia de Datos",
                    descripcion = "Primer acercamiento al análisis de datos y su aplicación a problemas reales. Incluye obtención, limpieza, exploración y visualización de datos, construcción de modelos estadísticos básicos y evaluación de resultados.",
                    carpeta = cuatrimestre1Datos
                )
            )

            val programacionI = materiaRepo.save(
                Materia(
                    nombre = "Programación I",
                    descripcion = "Introducción a la programación utilizando Python. Se trabajan estructuras de control, tipos de datos, programación orientada a objetos, visualización de datos y herramientas fundamentales para el análisis computacional.",
                    carpeta = cuatrimestre1Datos
                )
            )


            // ===== 2° CUATRIMESTRE =====

            val analisisII = materiaRepo.save(
                Materia(
                    nombre = "Análisis II",
                    descripcion = "Extensión del cálculo a varias variables. Incluye funciones vectoriales, derivadas parciales, integrales múltiples, ecuaciones diferenciales y herramientas matemáticas para modelar fenómenos complejos.",
                    carpeta = cuatrimestre2Datos
                )
            )

            val matematicaDiscreta = materiaRepo.save(
                Materia(
                    nombre = "Matemática Discreta",
                    descripcion = "Fundamentos matemáticos para la informática y la ciencia de datos. Abarca lógica, combinatoria, teoría de grafos, álgebra lineal, matrices, espacios vectoriales y transformaciones lineales.",
                    carpeta = cuatrimestre2Datos
                )
            )

            val introduccionAA = materiaRepo.save(
                Materia(
                    nombre = "Introducción al Aprendizaje Automático",
                    descripcion = "Presentación de los conceptos fundamentales del aprendizaje automático, incluyendo regresión, clasificación, regularización, árboles de decisión, máquinas de soporte vectorial y evaluación de modelos.",
                    carpeta = cuatrimestre2Datos
                )
            )


            // ===== 3° CUATRIMESTRE =====

            val infraestructuraCD = materiaRepo.save(
                Materia(
                    nombre = "Infraestructura para Ciencia de Datos",
                    descripcion = "Estudio de la infraestructura tecnológica necesaria para proyectos de datos. Incluye arquitectura de computadoras, redes, virtualización, computación en la nube, clusters y procesamiento con GPU.",
                    carpeta = cuatrimestre3Datos
                )
            )

            val algoritmosICD = materiaRepo.save(
                Materia(
                    nombre = "Algoritmos I",
                    descripcion = "Diseño e implementación de programas utilizando estructuras de datos básicas, especificación formal y técnicas de construcción y validación de algoritmos.",
                    carpeta = cuatrimestre3Datos
                )
            )

            val probabilidadEstadistica = materiaRepo.save(
                Materia(
                    nombre = "Probabilidad y Estadística",
                    descripcion = "Introducción a la teoría de probabilidades y la estadística. Incluye distribuciones, inferencia, regresión, pruebas de hipótesis, procesos estocásticos y análisis descriptivo de datos.",
                    carpeta = cuatrimestre3Datos
                )
            )


            // ===== 4° CUATRIMESTRE =====

            val estadisticaInferenciaI = materiaRepo.save(
                Materia(
                    nombre = "Estadística e Inferencia I",
                    descripcion = "Estudio de métodos estadísticos clásicos y bayesianos para la construcción y validación de modelos. Incluye estimación, regresión, inferencia bayesiana y modelos gráficos.",
                    carpeta = cuatrimestre4Datos
                )
            )

            val algoritmosII2 = materiaRepo.save(
                Materia(
                    nombre = "Algoritmos II",
                    descripcion = "Profundización en estructuras de datos avanzadas y metodologías formales de especificación e implementación de algoritmos, incluyendo árboles, grafos y diccionarios.",
                    carpeta = cuatrimestre4Datos
                )
            )

            val electivaI = materiaRepo.save(
                Materia(
                    nombre = "Electiva I",
                    descripcion = "Espacio curricular destinado a complementar la formación mediante contenidos especializados elegidos por el estudiante.",
                    carpeta = cuatrimestre4Datos
                )
            )


            // ===== 5° CUATRIMESTRE =====

            val estadisticaInferenciaII = materiaRepo.save(
                Materia(
                    nombre = "Estadística e Inferencia II",
                    descripcion = "Continuación de los modelos estadísticos avanzados. Se estudian modelos bayesianos jerárquicos, procesos gaussianos, clustering, estimación de densidades y modelos no paramétricos.",
                    carpeta = cuatrimestre5Datos
                )
            )

            val programacionII = materiaRepo.save(
                Materia(
                    nombre = "Programación II",
                    descripcion = "Herramientas avanzadas de programación para ciencia de datos. Incluye análisis de rendimiento, desarrollo en Python, uso de bibliotecas especializadas y control de versiones.",
                    carpeta = cuatrimestre5Datos
                )
            )

            val electivaII = materiaRepo.save(
                Materia(
                    nombre = "Electiva II",
                    descripcion = "Asignatura optativa orientada a profundizar conocimientos en áreas específicas relacionadas con la ciencia de datos.",
                    carpeta = cuatrimestre5Datos
                )
            )


            // ===== 6° CUATRIMESTRE =====

            val cienciaDatos = materiaRepo.save(
                Materia(
                    nombre = "Ciencia de Datos",
                    descripcion = "Aplicación práctica de técnicas modernas de análisis de datos. Incluye métodos de muestreo, reducción de dimensionalidad, inferencia aproximada, visualización avanzada y modelado estadístico.",
                    carpeta = cuatrimestre6Datos
                )
            )

            val basesDatosCD = materiaRepo.save(
                Materia(
                    nombre = "Bases de Datos",
                    descripcion = "Diseño, implementación y administración de bases de datos. Abarca modelado de datos, SQL, optimización de consultas, concurrencia y recuperación de información.",
                    carpeta = cuatrimestre6Datos
                )
            )

            val ingenieriaSoftware = materiaRepo.save(
                Materia(
                    nombre = "Ingeniería de Software",
                    descripcion = "Principios y prácticas para el desarrollo de software de calidad. Incluye metodologías ágiles, DevOps, arquitectura de software, gestión de proyectos y aspectos éticos y legales.",
                    carpeta = cuatrimestre6Datos
                )
            )


            // ===== 7° CUATRIMESTRE =====

            val aprendizajeAutomatico = materiaRepo.save(
                Materia(
                    nombre = "Aprendizaje Automático",
                    descripcion = "Estudio profundo de algoritmos de aprendizaje supervisado. Incluye regresión logística, perceptrones, redes neuronales, árboles de decisión, random forests y support vector machines.",
                    carpeta = cuatrimestre7Datos
                )
            )

            val electivaIII = materiaRepo.save(
                Materia(
                    nombre = "Electiva III",
                    descripcion = "Espacio de especialización que permite profundizar conocimientos en áreas específicas de interés profesional o académico.",
                    carpeta = cuatrimestre7Datos
                )
            )

            val optativaI = materiaRepo.save(
                Materia(
                    nombre = "Optativa I",
                    descripcion = "Materia de libre elección destinada a ampliar la formación interdisciplinaria del estudiante.",
                    carpeta = cuatrimestre7Datos
                )
            )


            // ===== 8° CUATRIMESTRE =====

            val aprendizajeProfundo = materiaRepo.save(
                Materia(
                    nombre = "Aprendizaje Profundo",
                    descripcion = "Estudio de redes neuronales profundas y técnicas modernas de inteligencia artificial. Incluye CNN, LSTM, autoencoders, GANs, procesamiento de lenguaje natural y aprendizaje por refuerzo.",
                    carpeta = cuatrimestre8Datos
                )
            )

            val optativaII = materiaRepo.save(
                Materia(
                    nombre = "Optativa II",
                    descripcion = "Materia optativa destinada a profundizar competencias específicas relacionadas con el perfil profesional de la carrera.",
                    carpeta = cuatrimestre8Datos
                )
            )

            val optativaIII = materiaRepo.save(
                Materia(
                    nombre = "Optativa III",
                    descripcion = "Espacio curricular flexible para completar la formación mediante contenidos avanzados o interdisciplinarios.",
                    carpeta = cuatrimestre8Datos
                )
            )

            // ── Material publicado ─────────────────────────────────────────

            // Mate 1 — parciales
            materialRepo.save(Material(
                nombre = "Primer parcial 2023",
                descripcion = "Límites, continuidad y derivadas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2023",
                tamanio = 120, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Segundo parcial 2023",
                descripcion = "Integrales definidas e indefinidas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-2c-2023",
                tamanio = 98, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Primer parcial 2024",
                descripcion = "Sucesiones y series.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2024",
                tamanio = 110, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Mate 1 — apuntes
            materialRepo.save(Material(
                nombre = "Apunte — Límites y continuidad",
                descripcion = "Definición épsilon-delta, propiedades y criterios de continuidad.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/apunte-limites",
                tamanio = 245, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Apunte — Derivadas e integrales",
                descripcion = "Reglas de derivación, TVM, integrales por sustitución y por partes.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/apunte-derivadas",
                tamanio = 310, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía de práctica — Límites",
                descripcion = "Ejercicios resueltos y propuestos. Ideal para el primer parcial.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/guia-limites",
                tamanio = 175, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Algoritmos — materiales
            materialRepo.save(Material(
                nombre = "Parcial 2024 — Árboles y grafos",
                descripcion = "Incluye BFS, DFS y árbol de expansión mínima.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/parcial-2024",
                tamanio = 88, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Apunte — Listas enlazadas",
                descripcion = "Simple, doble y circular. Implementación en C.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/apunte-listas",
                tamanio = 200, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía de práctica — Recursividad",
                descripcion = "Ejercicios de factorial, Fibonacci, torres de Hanoi y variantes.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/guia-recursividad",
                tamanio = 155, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Base de Datos — materiales
            materialRepo.save(Material(
                nombre = "Apunte — Modelo Entidad-Relación",
                descripcion = "Entidades, atributos, relaciones, cardinalidades y paso al modelo relacional.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/apunte-er",
                tamanio = 280, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía SQL — Consultas avanzadas",
                descripcion = "JOINs, subconsultas, GROUP BY y funciones de agregación con ejercicios.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/guia-sql",
                tamanio = 190, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Parcial 2023 — Normalización",
                descripcion = "1FN, 2FN, 3FN y BCNF. Ejercicios de descomposición.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/parcial-normalizacion",
                tamanio = 95, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Sistemas Operativos — materiales
            materialRepo.save(Material(
                nombre = "Apunte — Procesos y Threads",
                descripcion = "Ciclo de vida, planificación y sincronización de procesos.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/so/apunte-procesos",
                tamanio = 320, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Parcial 2024 — Memoria y Scheduling",
                descripcion = "Algoritmos de reemplazo de páginas y políticas de scheduling.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/so/parcial-2024",
                tamanio = 130, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Desarrollo Web — materiales
            materialRepo.save(Material(
                nombre = "Apunte — REST y HTTP",
                descripcion = "Verbos, status codes, autenticación con JWT y diseño de APIs.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/web/apunte-rest",
                tamanio = 210, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Pendientes (para que el admin los vea en la sección de revisión)
            materialRepo.save(Material(
                nombre = "Resumen Algoritmos — sin revisar",
                descripcion = "Resumen rápido de algoritmos de ordenamiento.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/resumen-pendiente",
                tamanio = 75, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = noAdmin, estado = EstadoMaterial.PENDIENTE,
            ))
            materialRepo.save(Material(
                nombre = "Final de Mate 2 — pendiente de aprobación",
                descripcion = "Final del año pasado, lo subí para que lo revisen.",
                tipo = TipoMaterial.FINAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate2/final-pendiente",
                tamanio = 60, tipoArchivo = "pdf",
                materia = arquitecturaSO, usuario = solicitante, estado = EstadoMaterial.PENDIENTE,
            ))

            // ── Etiquetas ─────────────────────────────────────────────────
            val etiquetaGeneral = etiquetaRepo.save(Etiqueta(nombre = "General", portal = portal))
            val etiquetaAlgo = etiquetaRepo.save(Etiqueta(nombre = "Algoritmos", portal = portal))
            val etiquetaMatem = etiquetaRepo.save(Etiqueta(nombre = "Mate 1", portal = portal))
            val etiquetaSO = etiquetaRepo.save(Etiqueta(nombre = "Sistemas Op.", portal = portal))
            val etiquetaBD = etiquetaRepo.save(Etiqueta(nombre = "Base de Datos", portal = portal))
            val etiquetaWeb = etiquetaRepo.save(Etiqueta(nombre = "Desarrollo Web", portal = portal))

            // ── Tableros ──────────────────────────────────────────────────
            val tableroGeneral = foroRepo.save(Tablero(
                nombre = "Avisos generales del portal",
                descripcion = "Comunicados, novedades y recordatorios que aplican a toda la carrera.",
                etiqueta = etiquetaGeneral, portal = portal
            ))
            val tableroAlgo = foroRepo.save(Tablero(
                nombre = "Dudas de Algoritmos",
                descripcion = "Consultá sobre ejercicios, parciales y conceptos de AyED.",
                etiqueta = etiquetaAlgo, portal = portal
            ))
            val tableroMatem = foroRepo.save(Tablero(
                nombre = "Consultas de Mate 1",
                descripcion = "Límites, derivadas, integrales y lo que más duele del cuatri.",
                etiqueta = etiquetaMatem, portal = portal
            ))
            val tableroBD = foroRepo.save(Tablero(
                nombre = "Base de Datos — dudas y recursos",
                descripcion = "SQL, modelo relacional, normalización y todo lo que el profe no explicó bien.",
                etiqueta = etiquetaBD, portal = portal
            ))
            val tableroSO = foroRepo.save(Tablero(
                nombre = "Sistemas Operativos",
                descripcion = "Procesos, memoria, scheduling. Todo lo que hace que tu compu funcione.",
                etiqueta = etiquetaSO, portal = portal
            ))
            val tableroWeb = foroRepo.save(Tablero(
                nombre = "Desarrollo Web — consultas",
                descripcion = "Frontend, backend, APIs. Si rompiste algo en producción, este es tu lugar.",
                etiqueta = etiquetaWeb, portal = portal
            ))

            // ── Posts ─────────────────────────────────────────────────────

            // Tablero general
            val postAviso = postRepo.save(Post(
                titulo = "Bienvenidos al portal",
                contenido = "Este es el espacio oficial de la Tecnicatura. Cualquier duda administrativa la pueden dejar acá.",
                tablero = tableroGeneral, autor = admin
            ))
            postRepo.save(Post(contenido = "Gracias por el espacio, justo lo necesitábamos.", tablero = tableroGeneral, autor = noAdmin, postPadre = postAviso))
            postRepo.save(Post(contenido = "¿Van a subir el calendario de parciales acá también?", tablero = tableroGeneral, autor = noAdmin, postPadre = postAviso))
            postRepo.save(Post(
                titulo = "Cambio de aula — semana del 12/5",
                contenido = "La cursada de Mate 1 del lunes pasa al aula 204 por trabajos en el edificio principal.",
                tablero = tableroGeneral, autor = admin
            ))
            postRepo.save(Post(
                titulo = "Fechas de finales — julio 2025",
                contenido = "Se publicaron las fechas de finales. Matemática 1: 8/7, Algoritmos: 10/7, Sistemas Operativos: 14/7. Revisen el SIU para confirmarlo.",
                tablero = tableroGeneral, autor = admin
            ))

            // Tablero Algoritmos
            val postLista = postRepo.save(Post(
                titulo = "No entiendo los punteros en listas enlazadas",
                contenido = "Estoy haciendo el ejercicio de insertar al final de una lista simplemente enlazada y no logro que no explote cuando está vacía. ¿Alguna pista?",
                tablero = tableroAlgo, autor = noAdmin
            ))
            val respLista1 = postRepo.save(Post(
                contenido = "El problema clásico: antes de hacer `nodo->siguiente = NULL` tenés que verificar si `cabeza == NULL`. Si la lista está vacía, el nuevo nodo es directamente la nueva cabeza.",
                tablero = tableroAlgo, autor = admin, postPadre = postLista
            ))
            postRepo.save(Post(
                contenido = "Ah, eso era. Lo tenía al revés, primero asignaba siguiente y después chequeaba. Gracias.",
                tablero = tableroAlgo, autor = noAdmin, postPadre = respLista1
            ))
            val postBST = postRepo.save(Post(
                titulo = "¿Cuándo conviene usar árbol BST vs lista ordenada?",
                contenido = "Para el TP nos piden elegir entre ambas estructuras según el caso de uso. ¿Cuáles son los criterios clave para decidir?",
                tablero = tableroAlgo, autor = noAdmin
            ))
            postRepo.save(Post(
                contenido = "Depende del patrón de acceso. Si hacés muchas búsquedas: BST gana con O(log n) promedio. Si solo insertás al final y recorrés en orden: lista ordenada puede ser más simple. BST también gana si necesitás rango de valores (entre X e Y).",
                tablero = tableroAlgo, autor = admin, postPadre = postBST
            ))
            postRepo.save(Post(
                titulo = "¿Cómo funciona exactamente QuickSort en el peor caso?",
                contenido = "El profe dijo que QuickSort puede ser O(n²) pero no entendí cuándo ocurre eso exactamente.",
                tablero = tableroAlgo, autor = noAdmin
            ))

            // Tablero Mate 1
            val postIntegral = postRepo.save(Post(
                titulo = "Integral de 1/(1+x²) — ¿cuándo aparece arctan?",
                contenido = "En el parcial del año pasado usaron arctan para resolver una integral y no entiendo de dónde sale. ¿Me pueden explicar el razonamiento?",
                tablero = tableroMatem, autor = noAdmin
            ))
            postRepo.save(Post(
                contenido = "Es una integral estándar: la derivada de arctan(x) es exactamente 1/(1+x²). Cuando ves esa forma en el integrando, la antiderivada directa es arctan(x) + C. Conviene tenerla memorizada.",
                tablero = tableroMatem, autor = admin, postPadre = postIntegral
            ))
            postRepo.save(Post(
                titulo = "Resumen de criterios de convergencia",
                contenido = "Armé un resumen con los criterios de la razón, la raíz y comparación para series. Lo comparto por si le sirve a alguien antes del parcial.",
                tablero = tableroMatem, autor = noAdmin
            ))
            postRepo.save(Post(
                titulo = "¿Cómo sé si tengo que usar integración por partes o sustitución?",
                contenido = "Siempre me trabo eligiendo el método. ¿Hay algún criterio rápido para saber cuál usar?",
                tablero = tableroMatem, autor = noAdmin
            ))

            // Tablero Base de Datos
            val postSQL = postRepo.save(Post(
                titulo = "Diferencia entre INNER JOIN y LEFT JOIN",
                contenido = "Entiendo la teoría pero cuando tengo que aplicarlo en ejercicios me confundo. ¿Alguna forma fácil de recordarlo?",
                tablero = tableroBD, autor = noAdmin
            ))
            postRepo.save(Post(
                contenido = "INNER JOIN te devuelve solo las filas que tienen match en ambas tablas. LEFT JOIN te devuelve todas las filas de la tabla izquierda aunque no tengan match a la derecha (en ese caso los campos de la derecha vienen NULL). Si vas a listar todas las facturas aunque no tengan cliente asignado: LEFT JOIN.",
                tablero = tableroBD, autor = admin, postPadre = postSQL
            ))
            postRepo.save(Post(
                titulo = "Normalización — ¿qué diferencia hay entre 2FN y 3FN?",
                contenido = "El parcial tiene un ejercicio de normalizar una tabla y no tengo claro hasta dónde llegar con cada forma normal.",
                tablero = tableroBD, autor = noAdmin
            ))
            postRepo.save(Post(
                titulo = "¿PostgreSQL o MySQL para el TP?",
                contenido = "El enunciado no especifica el motor. ¿Alguno de los dos tiene ventajas concretas para el tipo de consultas que piden?",
                tablero = tableroBD, autor = noAdmin
            ))

            // Tablero Sistemas Operativos
            val postDeadlock = postRepo.save(Post(
                titulo = "No entiendo el deadlock — ejemplo concreto",
                contenido = "Sé la definición pero no logro visualizarlo. ¿Alguien tiene un ejemplo con código o pseudocódigo?",
                tablero = tableroSO, autor = noAdmin
            ))
            postRepo.save(Post(
                contenido = "Clásico: proceso A tiene el mutex1 y espera el mutex2. Proceso B tiene el mutex2 y espera el mutex1. Ninguno puede avanzar. La condición necesaria es el círculo de espera: A espera algo que B tiene, y B espera algo que A tiene.",
                tablero = tableroSO, autor = admin, postPadre = postDeadlock
            ))
            postRepo.save(Post(
                titulo = "Scheduling — ¿cuándo conviene Round Robin sobre SJF?",
                contenido = "En los ejercicios de parcial siempre me piden justificar la elección del algoritmo de scheduling y no sé bien qué argumentos usar.",
                tablero = tableroSO, autor = noAdmin
            ))

            // Tablero Desarrollo Web
            postRepo.save(Post(
                titulo = "¿Por qué mi fetch no funciona desde el frontend?",
                contenido = "Tengo el backend en localhost:8080 y el frontend en localhost:3000. La request me da error de CORS pero no sé dónde configurarlo.",
                tablero = tableroWeb, autor = noAdmin
            ))
            postRepo.save(Post(
                titulo = "JWT — ¿dónde guardo el token en el frontend?",
                contenido = "Vi que algunos lo guardan en localStorage y otros en cookies httpOnly. ¿Cuál es la práctica recomendada y por qué?",
                tablero = tableroWeb, autor = noAdmin
            ))

            println("✅ Datos de prueba cargados correctamente.")
            println("   Usuarios:")
            println("   - test@test.com  / 1234  → ADMIN del portal principal (ABIERTO)")
            println("   - admin@test.com / 1234  → ADMIN del portal principal (ABIERTO)")
            println("   - pedro@test.com / 1234  → MIEMBRO del portal principal")
            println("   - jose@test.com  / 1234  → MIEMBRO portal principal, ADMIN portalRedes (ABIERTO)")
            println("   - juan@test.com  / 1234  → solicitud PENDIENTE")
            println("   - maria@test.com / 1234  → solicitud RECHAZADA")
            println("   - carlos@test.com/ 1234  → BLOQUEADO")
            println("   - laura@test.com / 1234  → sin membresía → visitante ideal para probar acceso ABIERTO")
            println("")
            println("   Portales ABIERTOS (laura puede ver materias y foro sin ser miembro):")
            println("   - Tecnicatura en Programación Informática (UNSAM)")
            println("   - Tecnicatura en Redes Informáticas (UNSAM)")
            println("   Portales CERRADOS (laura solo ve la home y botón de solicitud):")
            println("   - Todos los demás")
        } else {
            println("ℹ️ La base de datos ya tiene datos, omitiendo inicialización...")
        }
    }
}