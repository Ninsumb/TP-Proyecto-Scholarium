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
                    descripcion = "Portal de la carrera de Programación: Full Stack, C y lenguajes raros.",
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
                descripcion = "Redes, protocolos y todo lo que mantiene internet en pie.",
                iconoPortal = "Network",
                colorPortal = "#7C3AED",
                tipoAcceso = TipoAcceso.ABIERTO,
            ))

            // CERRADO: los siguientes portales funcionan como antes
            val portalDatos = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Licenciatura en Ciencias de Datos",
                descripcion = "Datos, modelos y predicciones.",
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
            membresiaRepo.save(Membresia(usuario = nuevoAdmin, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = noAdmin, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portalRedes, rol = RolMembresia.ADMIN))
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

            // ── Carpetas ──────────────────────────────────────────────────
            val carpetaPrimerAnio = carpetaRepo.save(Carpeta(nombre = "Primer Año", portal = portal))
            val carpetaSegundoAnio = carpetaRepo.save(Carpeta(nombre = "Segundo Año", portal = portal))
            val carpetaTercerAnio = carpetaRepo.save(Carpeta(nombre = "Tercer Año", portal = portal))
            val carpetaElectivas = carpetaRepo.save(Carpeta(nombre = "Electivas", portal = portal))

            // Subcarpetas
            val carpetaCuatri1 = carpetaRepo.save(Carpeta(nombre = "Primer Cuatrimestre", portal = portal, carpetaPadre = carpetaPrimerAnio))
            val carpetaCuatri2 = carpetaRepo.save(Carpeta(nombre = "Segundo Cuatrimestre", portal = portal, carpetaPadre = carpetaPrimerAnio))
            val carpetaSeg1 = carpetaRepo.save(Carpeta(nombre = "Primer Cuatrimestre", portal = portal, carpetaPadre = carpetaSegundoAnio))
            val carpetaSeg2 = carpetaRepo.save(Carpeta(nombre = "Segundo Cuatrimestre", portal = portal, carpetaPadre = carpetaSegundoAnio))

            // ── Materias ──────────────────────────────────────────────────
            // Primer año, cuatri 1
            val materiaAlgo = materiaRepo.save(Materia(nombre = "Algoritmos y Estructuras de Datos", carpeta = carpetaCuatri1))
            val materiaMatem = materiaRepo.save(Materia(nombre = "Matemática 1", carpeta = carpetaCuatri1))
            val materiaIntro = materiaRepo.save(Materia(nombre = "Introducción a la Programación", carpeta = carpetaCuatri1))

            // Primer año, cuatri 2
            val materiaSO = materiaRepo.save(Materia(nombre = "Sistemas Operativos", carpeta = carpetaCuatri2))
            val materiaArqui = materiaRepo.save(Materia(nombre = "Arquitectura de Computadoras", carpeta = carpetaCuatri2))
            val materiaMatem2 = materiaRepo.save(Materia(nombre = "Matemática 2", carpeta = carpetaCuatri2))

            // Segundo año, cuatri 1
            val materiaBD = materiaRepo.save(Materia(nombre = "Base de Datos", carpeta = carpetaSeg1))
            val materiaRedes = materiaRepo.save(Materia(nombre = "Redes de Computadoras", carpeta = carpetaSeg1))

            // Segundo año, cuatri 2
            val materiaWeb = materiaRepo.save(Materia(nombre = "Desarrollo Web", carpeta = carpetaSeg2))
            val materiaSec = materiaRepo.save(Materia(nombre = "Seguridad Informática", carpeta = carpetaSeg2))

            // Electivas
            val materiaIA = materiaRepo.save(Materia(nombre = "Inteligencia Artificial", carpeta = carpetaElectivas))
            val materiaCloud = materiaRepo.save(Materia(nombre = "Cloud Computing", carpeta = carpetaElectivas))

            // ── Material publicado ─────────────────────────────────────────

            // Mate 1 — parciales
            materialRepo.save(Material(
                nombre = "Primer parcial 2023",
                descripcion = "Límites, continuidad y derivadas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2023",
                tamanio = 120, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Segundo parcial 2023",
                descripcion = "Integrales definidas e indefinidas.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-2c-2023",
                tamanio = 98, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Primer parcial 2024",
                descripcion = "Sucesiones y series.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/parcial-1c-2024",
                tamanio = 110, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Mate 1 — apuntes
            materialRepo.save(Material(
                nombre = "Apunte — Límites y continuidad",
                descripcion = "Definición épsilon-delta, propiedades y criterios de continuidad.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/apunte-limites",
                tamanio = 245, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Apunte — Derivadas e integrales",
                descripcion = "Reglas de derivación, TVM, integrales por sustitución y por partes.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/apunte-derivadas",
                tamanio = 310, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía de práctica — Límites",
                descripcion = "Ejercicios resueltos y propuestos. Ideal para el primer parcial.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate1/guia-limites",
                tamanio = 175, tipoArchivo = "pdf",
                materia = materiaMatem, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Algoritmos — materiales
            materialRepo.save(Material(
                nombre = "Parcial 2024 — Árboles y grafos",
                descripcion = "Incluye BFS, DFS y árbol de expansión mínima.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/parcial-2024",
                tamanio = 88, tipoArchivo = "pdf",
                materia = materiaAlgo, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Apunte — Listas enlazadas",
                descripcion = "Simple, doble y circular. Implementación en C.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/apunte-listas",
                tamanio = 200, tipoArchivo = "pdf",
                materia = materiaAlgo, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía de práctica — Recursividad",
                descripcion = "Ejercicios de factorial, Fibonacci, torres de Hanoi y variantes.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/guia-recursividad",
                tamanio = 155, tipoArchivo = "pdf",
                materia = materiaAlgo, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Base de Datos — materiales
            materialRepo.save(Material(
                nombre = "Apunte — Modelo Entidad-Relación",
                descripcion = "Entidades, atributos, relaciones, cardinalidades y paso al modelo relacional.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/apunte-er",
                tamanio = 280, tipoArchivo = "pdf",
                materia = materiaBD, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Guía SQL — Consultas avanzadas",
                descripcion = "JOINs, subconsultas, GROUP BY y funciones de agregación con ejercicios.",
                tipo = TipoMaterial.GUIA_EJERCICIOS,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/guia-sql",
                tamanio = 190, tipoArchivo = "pdf",
                materia = materiaBD, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Parcial 2023 — Normalización",
                descripcion = "1FN, 2FN, 3FN y BCNF. Ejercicios de descomposición.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/bd/parcial-normalizacion",
                tamanio = 95, tipoArchivo = "pdf",
                materia = materiaBD, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Sistemas Operativos — materiales
            materialRepo.save(Material(
                nombre = "Apunte — Procesos y Threads",
                descripcion = "Ciclo de vida, planificación y sincronización de procesos.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/so/apunte-procesos",
                tamanio = 320, tipoArchivo = "pdf",
                materia = materiaSO, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))
            materialRepo.save(Material(
                nombre = "Parcial 2024 — Memoria y Scheduling",
                descripcion = "Algoritmos de reemplazo de páginas y políticas de scheduling.",
                tipo = TipoMaterial.PARCIAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/so/parcial-2024",
                tamanio = 130, tipoArchivo = "pdf",
                materia = materiaSO, usuario = noAdmin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Desarrollo Web — materiales
            materialRepo.save(Material(
                nombre = "Apunte — REST y HTTP",
                descripcion = "Verbos, status codes, autenticación con JWT y diseño de APIs.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/web/apunte-rest",
                tamanio = 210, tipoArchivo = "pdf",
                materia = materiaWeb, usuario = admin, estado = EstadoMaterial.PUBLICADO,
            ))

            // Pendientes (para que el admin los vea en la sección de revisión)
            materialRepo.save(Material(
                nombre = "Resumen Algoritmos — sin revisar",
                descripcion = "Resumen rápido de algoritmos de ordenamiento.",
                tipo = TipoMaterial.APUNTE,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/algo/resumen-pendiente",
                tamanio = 75, tipoArchivo = "pdf",
                materia = materiaAlgo, usuario = noAdmin, estado = EstadoMaterial.PENDIENTE,
            ))
            materialRepo.save(Material(
                nombre = "Final de Mate 2 — pendiente de aprobación",
                descripcion = "Final del año pasado, lo subí para que lo revisen.",
                tipo = TipoMaterial.FINAL,
                url = "https://res.cloudinary.com/demo/image/upload/sample.pdf",
                publicId = "scholarium/mate2/final-pendiente",
                tamanio = 60, tipoArchivo = "pdf",
                materia = materiaMatem2, usuario = solicitante, estado = EstadoMaterial.PENDIENTE,
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