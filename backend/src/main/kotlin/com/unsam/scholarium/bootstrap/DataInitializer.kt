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
            usuarioRepo.save(nuevoAdmin)

            val admin = usuarioRepo.save(
                Usuario(nombre = "Valentino", email = "test@test.com", password = passwordEncoder.encode("1234"))
            )
            admin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/test.jpg", admin.id!!)
            usuarioRepo.save(admin)

            // Solicitante con solicitud PENDIENTE
            val solicitante = usuarioRepo.save(
                Usuario(nombre = "Juan García", email = "juan@test.com", password = passwordEncoder.encode("1234"))
            )
            solicitante.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/juan.jpg", solicitante.id!!)
            usuarioRepo.save(solicitante)

            // Miembro normal
            val noAdmin = usuarioRepo.save(
                Usuario(nombre = "Pedro López", email = "pedro@test.com", password = passwordEncoder.encode("1234"))
            )
            noAdmin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/pedro.jpg", noAdmin.id!!)
            usuarioRepo.save(noAdmin)

            // Usuario con solicitud RECHAZADA (para probar la vista de estado rechazado)
            val rechazado = usuarioRepo.save(
                Usuario(nombre = "María Fernández", email = "maria@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(rechazado)

            // Usuario bloqueado (para probar que no puede enviar solicitudes)
            val bloqueado = usuarioRepo.save(
                Usuario(nombre = "Carlos Gomez", email = "carlos@test.com", password = passwordEncoder.encode("1234"))
            )
            usuarioRepo.save(bloqueado)

            // Usuario ADMIN de
            val variasMembresias = usuarioRepo.save(
                Usuario(nombre = "Jose VariasMembresiasez", email = "jose@test.com", password = passwordEncoder.encode("1234"))
            )

            // ── Portales ──────────────────────────────────────────────────
            // Todos se guardan en variables para crearles PlantillaSolicitud.
            val portal = portalRepo.save(
                Portal(
                    universidad = "Universidad Nacional de San Martín",
                    carrera = "Tecnicatura en Programación Informática",
                    unidadAcademica = "Escuela de Ciencia y Tecnología",
                    descripcion = "Portal de la carrera de Programación: Full Stack, C y lenguajes raros.",
                    iconoPortal = "Code",
                    colorPortal = "#2563EB"
                )
            )
            val portalRedes = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Tecnicatura en Redes Informáticas",
                unidadAcademica = "Escuela de Ciencia y Tecnología",
                descripcion = "Redes, protocolos y todo lo que mantiene internet en pie.",
                iconoPortal = "Network",
                colorPortal = "#7C3AED"
            ))
            val portalDatos = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Licenciatura en Ciencias de Datos",
                descripcion = "Datos, modelos y predicciones.",
                iconoPortal = "BarChart2",
                colorPortal = "#059669"
            ))
            val portalEspacial = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Ingeniería Espacial",
                descripcion = "Sí, es ciencia de cohetes.",
                iconoPortal = "Rocket",
                colorPortal = "#DC2626"
            ))
            val portalAlimentos = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Ingeniería en Alimentos",
                descripcion = "Diseño y construcción de alimentos.",
                iconoPortal = "FlaskConical",
                colorPortal = "#D97706"
            ))
            val portalElectronica = portalRepo.save(Portal(
                universidad = "UTN",
                carrera = "Ingeniería Electrónica",
                descripcion = "xD.",
                iconoPortal = "Cpu",
                colorPortal = "#0891B2"
            ))
            val portalInformaticaUTN = portalRepo.save(Portal(
                universidad = "UTN",
                carrera = "Ingeniería Informática",
                descripcion = "Dijkstra y amigos.",
                iconoPortal = "Terminal",
                colorPortal = "#4F46E5"
            ))
            val portalUADE = portalRepo.save(Portal(
                universidad = "UADE",
                carrera = "Cualquier Carrera",
                descripcion = "Te vendemos el título.",
                iconoPortal = "GraduationCap",
                colorPortal = "#BE185D"
            ))

            // ── Membresías ────────────────────────────────────────────────
            membresiaRepo.save(Membresia(usuario = admin, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = nuevoAdmin, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = noAdmin, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portalRedes, rol = RolMembresia.ADMIN))

            // ── PlantillaSolicitud ─────────────────────────────────────────
            // Los portales se crean directamente en el repo (sin pasar por createPortal),
            // así que hay que crearles la PlantillaSolicitud a mano.
            // El portal principal tiene requisitos personalizados; el resto usa el texto default.
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
            // PENDIENTE: juan quiere unirse
            solicitudRepo.save(
                Solicitud(
                    usuario = solicitante,
                    portal = portal,
                    nombreCompleto = "Juan García",
                    descripcion = "Soy alumno regular de primer año. Quiero acceder a los materiales " +
                            "de Algoritmos y participar del foro para hacer consultas.",
                )
            )

            // RECHAZADA: maria fue rechazada con motivo
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

            // BLOQUEADO: carlos está bloqueado y no puede enviar solicitudes
            bloqueoRepo.save(
                PortalBloqueo(
                    portal = portal,
                    usuario = bloqueado,
                    motivo = "Comportamiento inapropiado en el foro. Bloqueado por los admins.",
                )
            )

            // ── Carpeta y materias ────────────────────────────────────────
            val carpeta = carpetaRepo.save(Carpeta(nombre = "carpeta test", portal = portal))
            val carpetita = carpetaRepo.save(Carpeta(nombre = "Carpeta 2", portal = portal))
            val carpeteta = carpetaRepo.save(Carpeta(nombre = "Carpeta 3", portal = portal))
            val carpintero = carpetaRepo.save(Carpeta(nombre = "Carpeta 2a", portal = portal, carpetaPadre = carpetita))
            val carpetaJodida = carpetaRepo.save(Carpeta(nombre = "Carpeta test chiquita", portal = portal, carpetaPadre = carpeta))

            val materiaAlgo = materiaRepo.save(Materia(nombre = "Algoritmos y Estructuras de Datos", carpeta = carpeta))
            val materiaMatem = materiaRepo.save(Materia(nombre = "Mate 1", carpeta = carpeta))
            val materiaSO = materiaRepo.save(Materia(nombre = "Sistemas Operativos", carpeta = carpeta))

            // ── Material ──────────────────────────────────────────────────
                
        // Mate 1 — conjunto de materiales PUBLICADOs

        // Parciales
        materialRepo.save(
            Material(
                nombre = "Primer parcial 2023",
                descripcion = "Parcial del primer cuatrimestre 2023. Temas: límites, continuidad y derivadas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2023.pdf",
                tamanio = 120,
                tipoArchivo = "pdf",
                materia = materiaMatem,
                usuario = admin,
                estado = EstadoMaterial.PUBLICADO,
            )
        )
        materialRepo.save(
            Material(
                nombre = "Segundo parcial 2023",
                descripcion = "Parcial del segundo cuatrimestre 2023. Temas: integrales definidas e indefinidas, técnicas de integración.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-2c-2023.pdf",
                tamanio = 98,
                tipoArchivo = "pdf",
                materia = materiaMatem,
                usuario = admin,
                estado = EstadoMaterial.PUBLICADO,
            )
        )
        materialRepo.save(
            Material(
                nombre = "Primer parcial 2024",
                descripcion = "Parcial del primer cuatrimestre 2024. Incluye sucesiones y series.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2024.pdf",
                tamanio = 110,
                tipoArchivo = "pdf",
                materia = materiaMatem,
                usuario = noAdmin,
                estado = EstadoMaterial.PUBLICADO,
            )
        )
        materialRepo.save(
            Material(
                nombre = "Primer parcial 2025",
                descripcion = "Parcial del primer cuatrimestre 2025. Temas: límites y derivadas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://test.com",
                publicId = "test/test.pdf",
                tamanio = 8,
                tipoArchivo = "pdf",
                materia = materiaMatem,
                usuario = noAdmin,
                estado = EstadoMaterial.PUBLICADO,
            )
        )

// Apuntes
materialRepo.save(
    Material(
        nombre = "Apunte — Límites y continuidad",
        descripcion = "Resumen teórico con definición épsilon-delta, propiedades de límites y criterios de continuidad.",
        tipo = TipoMaterial.APUNTE,
        url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        publicId = "scholarium/mate1/apunte-limites.pdf",
        tamanio = 245,
        tipoArchivo = "pdf",
        materia = materiaMatem,
        usuario = noAdmin,
        estado = EstadoMaterial.PUBLICADO,
    )
)
materialRepo.save(
    Material(
        nombre = "Apunte — Derivadas e integrales",
        descripcion = "Reglas de derivación, teorema del valor medio, integrales por sustitución y por partes.",
        tipo = TipoMaterial.APUNTE,
        url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        publicId = "scholarium/mate1/apunte-derivadas-integrales.pdf",
        tamanio = 310,
        tipoArchivo = "pdf",
        materia = materiaMatem,
        usuario = admin,
        estado = EstadoMaterial.PUBLICADO,
    )
)
materialRepo.save(
    Material(
        nombre = "Apunte — Series y sucesiones",
        descripcion = "Criterios de convergencia: razón, raíz y comparación. Series de Taylor y Maclaurin.",
        tipo = TipoMaterial.APUNTE,
        url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        publicId = "scholarium/mate1/apunte-series.pdf",
        tamanio = 189,
        tipoArchivo = "pdf",
        materia = materiaMatem,
        usuario = noAdmin,
        estado = EstadoMaterial.PUBLICADO,
    )
)

// Prácticas
materialRepo.save(
    Material(
        nombre = "Guía de práctica — Límites",
        descripcion = "Ejercicios resueltos y propuestos sobre cálculo de límites. Ideal para preparar el primer parcial.",
        tipo = TipoMaterial.GUIA_EJERCICIOS,
        url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        publicId = "scholarium/mate1/GUIA_EJERCICIOS-limites.pdf",
        tamanio = 175,
        tipoArchivo = "pdf",
        materia = materiaMatem,
        usuario = admin,
        estado = EstadoMaterial.PUBLICADO,
    )
)
materialRepo.save(
    Material(
        nombre = "Guía de práctica — Integrales",
        descripcion = "Ejercicios de integración por sustitución, por partes y fracciones parciales con soluciones.",
        tipo = TipoMaterial.GUIA_EJERCICIOS,
        url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        publicId = "scholarium/mate1/GUIA_EJERCICIOS-integrales.pdf",
        tamanio = 202,
        tipoArchivo = "pdf",
        materia = materiaMatem,
        usuario = noAdmin,
        estado = EstadoMaterial.PUBLICADO,
    )
)

            // ── Etiquetas ─────────────────────────────────────────────────
            val etiquetaGeneral = etiquetaRepo.save(Etiqueta(nombre = "General", portal = portal))
            val etiquetaAlgo = etiquetaRepo.save(Etiqueta(nombre = "Algoritmos", portal = portal))
            val etiquetaMatem = etiquetaRepo.save(Etiqueta(nombre = "Mate 1", portal = portal))
            val etiquetaSO = etiquetaRepo.save(Etiqueta(nombre = "Sistemas Op.", portal = portal))

            // ── Tableros ──────────────────────────────────────────────────
            val tableroGeneral = foroRepo.save(
                Tablero(nombre = "Avisos generales del portal", descripcion = "Espacio para comunicados, novedades y recordatorios que aplican a toda la carrera.", etiqueta = etiquetaGeneral, portal = portal)
            )
            val tableroAlgo = foroRepo.save(
                Tablero(nombre = "Dudas de Algoritmos", descripcion = "Consultá sobre ejercicios, parciales y conceptos de Algoritmos y Estructuras de Datos.", etiqueta = etiquetaAlgo, portal = portal)
            )
            val tableroMatem = foroRepo.save(
                Tablero(nombre = "Consultas de Mate 1", descripcion = "Para preguntas sobre límites, derivadas, integrales y lo que más duele del cuatri.", etiqueta = etiquetaMatem, portal = portal)
            )

            // ── Posts ─────────────────────────────────────────────────────
            val postAviso = postRepo.save(Post(titulo = "Bienvenidos al portal", contenido = "Este es el espacio oficial del portal de Tecnicatura. Cualquier duda administrativa la pueden dejar acá.", tablero = tableroGeneral, autor = admin))
            postRepo.save(Post(contenido = "Gracias por el espacio, justo lo necesitábamos.", tablero = tableroGeneral, autor = noAdmin, postPadre = postAviso))
            postRepo.save(Post(contenido = "¿Van a subir el calendario de parciales acá también?", tablero = tableroGeneral, autor = noAdmin, postPadre = postAviso))
            postRepo.save(Post(titulo = "Cambio de aula - Semana del 12/5", contenido = "La cursada de Mate 1 del lunes pasa al aula 204 por trabajos en el edificio principal.", tablero = tableroGeneral, autor = admin))

            val postLista = postRepo.save(Post(titulo = "No entiendo los punteros en listas enlazadas", contenido = "Estoy haciendo el ejercicio de insertar al final de una lista simplemente enlazada y no logro que no explote cuando la lista está vacía. ¿Alguna pista?", tablero = tableroAlgo, autor = noAdmin))
            val respLista1 = postRepo.save(Post(contenido = "El problema clásico: antes de hacer `nodo->siguiente = NULL` tenés que verificar si `cabeza == NULL`. Si la lista está vacía, el nuevo nodo es directamente la nueva cabeza.", tablero = tableroAlgo, autor = admin, postPadre = postLista))
            postRepo.save(Post(contenido = "Ah, eso era. Lo tenía al revés, primero asignaba siguiente y después chequeaba. Gracias.", tablero = tableroAlgo, autor = noAdmin, postPadre = respLista1))
            postRepo.save(Post(titulo = "¿Cuándo conviene usar árbol BST vs lista ordenada?", contenido = "Para el TP nos piden elegir entre ambas estructuras según el caso de uso. ¿Cuáles son los criterios clave para decidir?", tablero = tableroAlgo, autor = noAdmin))

            val postIntegral = postRepo.save(Post(titulo = "Integral de 1/(1+x²) - ¿cuándo aparece arctan?", contenido = "En el parcial del año pasado usaron arctan para resolver una integral y no entiendo de dónde sale. ¿Me pueden explicar el razonamiento?", tablero = tableroMatem, autor = noAdmin))
            postRepo.save(Post(contenido = "Es una integral estándar: la derivada de arctan(x) es exactamente 1/(1+x²). Entonces cuando ves esa forma en el integrando, la antiderivada directa es arctan(x) + C. Conviene tenerla memorizada.", tablero = tableroMatem, autor = admin, postPadre = postIntegral))
            postRepo.save(Post(titulo = "Resumen de criterios de convergencia", contenido = "Armé un resumen con los criterios de la razón, la raíz y comparación para series. Lo comparto por si le sirve a alguien antes del parcial.", tablero = tableroMatem, autor = noAdmin))

            println("✅ Datos de prueba cargados correctamente.")
            println("   Usuarios de prueba:")
            println("   - test@test.com / 1234  → ADMIN del portal principal")
            println("   - pedro@test.com / 1234 → MIEMBRO del portal principal")
            println("   - juan@test.com / 1234  → tiene solicitud PENDIENTE")
            println("   - maria@test.com / 1234 → tiene solicitud RECHAZADA (puede reenviar)")
            println("   - carlos@test.com / 1234 → BLOQUEADO (no puede enviar solicitudes)")
            println("   - jose@test.com / 1234 → MIEMBRO de portal y ADMIN de portalRedes")
        } else {
            println("ℹ️ La base de datos ya tiene datos, omitiendo inicialización...")
        }
    }
}