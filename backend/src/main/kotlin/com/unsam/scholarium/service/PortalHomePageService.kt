package com.unsam.scholarium.service

import com.unsam.scholarium.dto.UpdateBlocksRequest
import com.unsam.scholarium.exception.BusinessException
import com.unsam.scholarium.exception.ElementDoesNotExistException
import com.unsam.scholarium.exception.NotAdminException
import com.unsam.scholarium.model.Block
import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.PortalHomePage
import com.unsam.scholarium.model.RolMembresia
import com.unsam.scholarium.repository.MembresiaRepository
import com.unsam.scholarium.repository.PortalHomePageRepository
import com.unsam.scholarium.repository.PortalRepository
import com.unsam.scholarium.repository.UsuarioRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull

@Service
class PortalHomePageService(
    private val portalHomePageRepository: PortalHomePageRepository,
    private val portalRepository: PortalRepository,
    private val usuarioRepository: UsuarioRepository,
    private val membresiaRepository: MembresiaRepository
) {

    fun getBlocks(portalId: Long): List<Block> {
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $portalId no encontrado")

        val homePage = portalHomePageRepository.findByPortalId(portalId)

        return homePage?.blocks ?: getDefaultBlocks(portal)
    }

    @Transactional(rollbackOn = [Exception::class])
    fun updateBlocks(
        portalId: Long,
        email: String,
        request: UpdateBlocksRequest
    ): PortalHomePage {
        // Validaciones
        val portal = portalRepository.findById(portalId).getOrNull()
            ?: throw ElementDoesNotExistException("Portal $portalId no encontrado")

        val usuario = usuarioRepository.findByEmail(email)
            ?: throw ElementDoesNotExistException("Usuario no encontrado")

        val membresia = membresiaRepository.findByUsuarioIdAndPortalId(usuario.id!!, portalId)
            ?: throw NotAdminException("No sos miembro del portal")

        if (membresia.rol != RolMembresia.ADMIN) {
            throw NotAdminException("Solo los administradores pueden editar la página")
        }

        // Validaciones de negocio
        if (request.blocks.isEmpty()) {
            throw BusinessException("Debe haber al menos un bloque")
        }

        if (request.blocks.size > 30) {
            throw BusinessException("Máximo 30 bloques permitidos")
        }

        // Actualizar o crear
        val existingHomePage = portalHomePageRepository.findByPortalId(portalId)

        return if (existingHomePage != null) {
            val updated = existingHomePage.copy(
                blocks = request.blocks,
                updatedAt = LocalDateTime.now(),
                updatedBy = usuario.id
            )
            portalHomePageRepository.save(updated)
        } else {
            val newHomePage = PortalHomePage(
                portalId = portalId,
                blocks = request.blocks,
                updatedBy = usuario.id
            )
            portalHomePageRepository.save(newHomePage)
        }
    }

    private fun getDefaultBlocks(portal: Portal): List<Block> {
        return listOf(
            Block(
                type = "header",
                id = "default-header",
                data = mapOf(
                    "title" to "¡Bienvenido al portal de tu carrera!",
                    "description" to "Lo que estás viendo es la página de inico, la carta de presentación del portal: la primera impresión que van a tener los nuevos miembros y cualquier usuario que quiera formar parte de la comunidad. Por lo tanto, es importante que como administradores cuiden y personalicen este espacio. \n\nA continuación, un recorrido por los bloques disponibles para que puedas armar la página de tu carrera. \n\n¿Empezamos?"
                )
            ),
            Block(
                type = "textSection",
                id = "default-textsection",
                data = mapOf(
                    "title" to "📝 Bloque: Sección de Texto",
                    "content" to "Este bloque te permite escribir un título y un párrafo de texto libre. Es ideal para describir la carrera, presentar el equipo docente, explicar requisitos de cursada, o cualquier información que quieras comunicar de forma directa.\n\nPodés editar este bloque haciendo click sobre él en el editor, o eliminarlo si no lo necesitás."
                )
            ),
            Block(
                type = "richText",
                id = "default-richtext",
                data = mapOf(
                    "title" to "✍️ Bloque: Texto Enriquecido (Markdown)",
                    "markdown" to "Este bloque soporta **Markdown completo**. Podés usar:\n\n## Encabezados\n\n- Listas con viñetas\n- Otro ítem\n  - Sublistas\n\n1. Listas numeradas\n2. Segundo ítem\n\n> Citas o destacados importantes\n\n`código en línea` o bloques de código:\n\n```\ncódigo multilínea\n```\n\n**Negrita**, *cursiva*, ~~tachado~~, [enlaces](https://ejemplo.com)\n\n---\n\nEs el bloque más flexible. Usalo para el reglamento del portal, el plan de estudios detallado, o cualquier contenido que necesite formato rico."
                )
            ),
            Block(
                type = "stats",
                id = "default-stats",
                data = mapOf(
                    "stats" to listOf(
                        mapOf("icon" to "users", "value" to "—", "label" to "Estudiantes activos"),
                        mapOf("icon" to "bookOpen", "value" to "—", "label" to "Materias disponibles"),
                        mapOf("icon" to "trendingUp", "value" to "—", "label" to "Materiales compartidos")
                    )
                )
            ),
            Block(
                type = "textSection",
                id = "default-stats-info",
                data = mapOf(
                    "title" to "📊 Bloque: Estadísticas",
                    "content" to "El bloque de arriba es un ejemplo del bloque Estadísticas. Muestra hasta 3 tarjetas con un número destacado y una etiqueta. Es útil para mostrar datos del portal como cantidad de estudiantes, materias o materiales. Reemplazá los guiones por los valores reales de tu carrera."
                )
            ),
            Block(
                type = "infoList",
                id = "default-infolist",
                data = mapOf(
                    "title" to "📋 Bloque: Lista de Información",
                    "items" to listOf(
                        mapOf("icon" to "mail", "label" to "Email de contacto", "value" to "secretaria@universidad.edu"),
                        mapOf("icon" to "phone", "label" to "Teléfono", "value" to "+54 11 0000-0000"),
                        mapOf("icon" to "mapPin", "label" to "Dirección", "value" to "Av. Universidad 1234, Ciudad"),
                        mapOf("icon" to "clock", "label" to "Horario de atención", "value" to "Lunes a viernes de 9 a 17 hs")
                    )
                )
            ),
            Block(
                type = "textSection",
                id = "default-stats-info",
                data = mapOf(
                    "title" to "¡La lista de información es realmente útil!",
                    "content" to "Ideal para datos de contacto y recursos rápidos: emails de la facultad, enlaces a grupos de estudiantes, horarios de atención del departamento, y todo lo que un ingresante ansía. Centralizar esa información acá ahorra mucho tiempo."
                )
            ),
            Block(
                type = "imageOnly",
                id = "default-image",
                data = mapOf(
                    "imageUrl" to "https://i.imgur.com/KqCy0U4.jpeg",
                    "title" to "🖼️ Bloque: Imagen",
                    "caption" to "Este bloque muestra una imagen a partir de una URL. Podés agregar un título y una pequeña descripción. Útil para fotos del edificio, del equipo, eventos, etc."
                )
            ),
            Block(
                type = "imageText",
                id = "default-imagetext",
                data = mapOf(
                    "imagePosition" to "left",
                    "imageUrl" to "https://i.imgur.com/uPd58ic.jpeg",
                    "title" to "🖼️ Bloque: Imagen con Texto",
                    "content" to "Este bloque combina una imagen lateral con un título y texto descriptivo. Podés elegir si la imagen va a la izquierda o a la derecha. Ideal para presentar instalaciones, actividades o cualquier contenido visual que necesite explicación."
                )
            ),
            Block(
                type = "cta",
                id = "default-cta",
                data = mapOf(
                    "text" to "¿Querés ser parte de este portal?",
                    "buttonText" to "Solicitar acceso",
                    "buttonLink" to "#"
                )
            ),
            Block(
                type = "textSection",
                id = "default-cta-info",
                data = mapOf(
                    "title" to "📣 Bloque: Call to Action",
                    "content" to "El bloque de arriba es un ejemplo del bloque Call to Action. Muestra un mensaje destacado con un botón que lleva a una URL. Es útil para invitar a los visitantes a unirse al portal, contactar a la secretaría, o acceder a un formulario."
                )
            ),
            Block(
                type = "textSection",
                id = "default-footer-info",
                data = mapOf(
                    "title" to "🚀 ¿Cómo empiezo a editar?",
                    "content" to "Todos los bloques que ves en esta página son ejemplos editables. Para personalizar el portal:\n\n1. Hacé click en el ícono de lápiz para abrir el editor.\n2. Seleccioná cualquier bloque para editarlo desde el panel derecho.\n3. Usá las flechas para reordenarlos.\n4. Eliminá los que no necesitás con el ícono de papelera.\n5. Agregá nuevos bloques desde el panel izquierdo.\n6. Guardá los cambios cuando termines."
                )
            )
        )
    }
}