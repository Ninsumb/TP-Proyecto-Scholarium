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
                            "folder",        "scholarium/fotos-perfil",
                            "public_id",     "usuario-$usuarioId",
                            "overwrite",     true,
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
            val admin = usuarioRepo.save(
                Usuario(
                    nombre = "Valentino",
                    email = "test@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )
            admin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/test.jpg", admin.id!!)
            usuarioRepo.save(admin)
            val solicitante = usuarioRepo.save(
                Usuario(
                    nombre = "Juan",
                    email = "juan@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )
            solicitante.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/juan.jpg", solicitante.id!!)
            usuarioRepo.save(solicitante)
            val noAdmin = usuarioRepo.save(
                Usuario(
                    nombre = "Pedro",
                    email = "pedro@test.com",
                    password = passwordEncoder.encode("1234")
                )
            )
            noAdmin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/pedro.jpg", noAdmin.id!!)
            usuarioRepo.save(noAdmin)

            // ── Portal ────────────────────────────────────────────────────
            val portal = portalRepo.save(
                Portal(
                    universidad = "Universidad Nacional de San Martín",
                    carrera = "Tecnicatura en Programación Informática"
                )
            )

            // ── Membresías ────────────────────────────────────────────────
            membresiaRepo.save(
                Membresia(
                    usuario = admin,
                    portal = portal,
                    rol = RolMembresia.ADMIN
                )
            )
            membresiaRepo.save(
                Membresia(
                    usuario = noAdmin,
                    portal = portal,
                    rol = RolMembresia.MIEMBRO
                )
            )

            // ── Solicitud ─────────────────────────────────────────────────
            solicitudRepo.save(
                Solicitud(
                    usuario = solicitante,
                    portal = portal,
                    titulo = "Solicitud de ingreso",
                    estado = Estado.PENDIENTE,
                    descripcion = "Quiero unirme al portal de Programación"
                )
            )

            // ── Carpeta y materias ────────────────────────────────────────
            val carpeta = carpetaRepo.save(
                Carpeta(nombre = "carpeta test", portal = portal)
            )

            val materiaAlgo = materiaRepo.save(
                Materia(nombre = "Algoritmos y Estructuras de Datos", carpeta = carpeta)
            )
            val materiaMatem = materiaRepo.save(
                Materia(nombre = "Mate 1", carpeta = carpeta)
            )
            val materiaSO = materiaRepo.save(
                Materia(nombre = "Sistemas Operativos", carpeta = carpeta)
            )

            // ── Material de prueba ────────────────────────────────────────
            materialRepo.save(
                Material(
                    nombre = "Primer parcial 2025",
                    descripcion = "parcial del primer cuatrimestre de 2025",
                    tipo = TipoMaterial.PARCIAL,
                    url = "https://test.com",
                    publicId = "test/test.pdf",
                    tamanio = 8,
                    tipoArchivo = "pdf",
                    materia = materiaMatem,
                    usuario = noAdmin,
                )
            )

            // ── Etiquetas ─────────────────────────────────────────────────
            // Una etiqueta GENERAL para el portal (para tableros no atados a una materia)
            val etiquetaGeneral = etiquetaRepo.save(
                Etiqueta(nombre = "GENERAL", portal = portal)
            )
            // Una etiqueta por materia (nombre corto, <= 30 chars que valida el modelo)
            val etiquetaAlgo = etiquetaRepo.save(
                Etiqueta(nombre = "Algoritmos", portal = portal)
            )
            val etiquetaMatem = etiquetaRepo.save(
                Etiqueta(nombre = "Mate 1", portal = portal)
            )
            val etiquetaSO = etiquetaRepo.save(
                Etiqueta(nombre = "Sistemas Op.", portal = portal)
            )

            // ── Tableros ──────────────────────────────────────────────────
            val tableroGeneral = foroRepo.save(
                Tablero(
                    nombre = "Avisos generales del portal",
                    descripcion = "Espacio para comunicados, novedades y recordatorios que aplican a toda la carrera.",
                    etiqueta = etiquetaGeneral,
                    portal = portal
                )
            )
            val tableroAlgo = foroRepo.save(
                Tablero(
                    nombre = "Dudas de Algoritmos",
                    descripcion = "Consultá sobre ejercicios, parciales y conceptos de Algoritmos y Estructuras de Datos.",
                    etiqueta = etiquetaAlgo,
                    portal = portal
                )
            )
            val tableroMatem = foroRepo.save(
                Tablero(
                    nombre = "Consultas de Mate 1",
                    descripcion = "Para preguntas sobre límites, derivadas, integrales y lo que más duele del cuatri.",
                    etiqueta = etiquetaMatem,
                    portal = portal
                )
            )

            // ── Posts ─────────────────────────────────────────────────────

            // Tablero GENERAL
            val postAviso = postRepo.save(
                Post(
                    titulo = "Bienvenidos al portal",
                    contenido = "Este es el espacio oficial del portal de Tecnicatura. Cualquier duda administrativa la pueden dejar acá.",
                    tablero = tableroGeneral,
                    autor = admin
                )
            )
            postRepo.save(
                Post(
                    contenido = "Gracias por el espacio, justo lo necesitábamos.",
                    tablero = tableroGeneral,
                    autor = noAdmin,
                    postPadre = postAviso
                )
            )
            postRepo.save(
                Post(
                    contenido = "¿Van a subir el calendario de parciales acá también?",
                    tablero = tableroGeneral,
                    autor = noAdmin,
                    postPadre = postAviso
                )
            )
            postRepo.save(
                Post(
                    titulo = "Cambio de aula - Semana del 12/5",
                    contenido = "La cursada de Mate 1 del lunes pasa al aula 204 por trabajos en el edificio principal.",
                    tablero = tableroGeneral,
                    autor = admin
                )
            )

            // Tablero ALGORITMOS
            val postLista = postRepo.save(
                Post(
                    titulo = "No entiendo los punteros en listas enlazadas",
                    contenido = "Estoy haciendo el ejercicio de insertar al final de una lista simplemente enlazada y no logro que no explote cuando la lista está vacía. ¿Alguna pista?",
                    tablero = tableroAlgo,
                    autor = noAdmin
                )
            )
            val respLista1 = postRepo.save(
                Post(
                    contenido = "El problema clásico: antes de hacer `nodo->siguiente = NULL` tenés que verificar si `cabeza == NULL`. Si la lista está vacía, el nuevo nodo es directamente la nueva cabeza.",
                    tablero = tableroAlgo,
                    autor = admin,
                    postPadre = postLista
                )
            )
            postRepo.save(
                Post(
                    contenido = "Ah, eso era. Lo tenía al revés, primero asignaba siguiente y después chequeaba. Gracias.",
                    tablero = tableroAlgo,
                    autor = noAdmin,
                    postPadre = respLista1
                )
            )
            postRepo.save(
                Post(
                    titulo = "¿Cuándo conviene usar árbol BST vs lista ordenada?",
                    contenido = "Para el TP nos piden elegir entre ambas estructuras según el caso de uso. ¿Cuáles son los criterios clave para decidir?",
                    tablero = tableroAlgo,
                    autor = noAdmin
                )
            )

            // Tablero MATE 1
            val postIntegral = postRepo.save(
                Post(
                    titulo = "Integral de 1/(1+x²) - ¿cuándo aparece arctan?",
                    contenido = "En el parcial del año pasado usaron arctan para resolver una integral y no entiendo de dónde sale. ¿Me pueden explicar el razonamiento?",
                    tablero = tableroMatem,
                    autor = noAdmin
                )
            )
            postRepo.save(
                Post(
                    contenido = "Es una integral estándar: la derivada de arctan(x) es exactamente 1/(1+x²). Entonces cuando ves esa forma en el integrando, la antiderivada directa es arctan(x) + C. Conviene tenerla memorizada.",
                    tablero = tableroMatem,
                    autor = admin,
                    postPadre = postIntegral
                )
            )
            postRepo.save(
                Post(
                    titulo = "Resumen de criterios de convergencia",
                    contenido = "Armé un resumen con los criterios de la razón, la raíz y comparación para series. Lo comparto por si le sirve a alguien antes del parcial.",
                    tablero = tableroMatem,
                    autor = noAdmin
                )
            )

            println("✅ Datos de prueba cargados correctamente.")

        } else {
            println("ℹ️ La base de datos ya tiene datos, omitiendo inicialización...")
        }
    }
}