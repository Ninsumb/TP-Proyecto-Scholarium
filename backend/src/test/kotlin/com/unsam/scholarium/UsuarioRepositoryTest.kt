package com.unsam.scholarium

import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.UsuarioRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDateTime

@DataJpaTest
@ActiveProfiles("test")
class UsuarioRepositoryTest {

    @Autowired
    private lateinit var usuarioRepository: UsuarioRepository

    @Test
    fun `debe guardar y recuperar un usuario`() {
        // Arrange
        val usuario = Usuario(
            nombre = "Juan",
            email = "juan.perez@example.com",
            contraseña = "hashedPassword123"
        )

        // Act
        val usuarioGuardado = usuarioRepository.save(usuario)
        val usuarioRecuperado = usuarioRepository.findById(usuarioGuardado.id!!)

        // Assert
        assertTrue(usuarioRecuperado.isPresent)
        assertEquals("Juan", usuarioRecuperado.get().nombre)
        assertEquals("juan.perez@example.com", usuarioRecuperado.get().email)
    }

    @Test
    fun `findByEmail debe encontrar usuario por email`() {
        // Arrange
        val usuario = Usuario(
            nombre = "María",
            email = "maria.gonzalez@example.com",
            contraseña = "hashedPassword456"
        )
        usuarioRepository.save(usuario)

        // Act
        val encontrado = usuarioRepository.findByEmail("maria.gonzalez@example.com")

        // Assert
        assertNotNull(encontrado)
        assertEquals("María", encontrado?.nombre)
    }

    @Test
    fun `findByEmail debe retornar null si no existe`() {
        // Act
        val encontrado = usuarioRepository.findByEmail("noexiste@example.com")

        // Assert
        assertNull(encontrado)
    }

    @Test
    fun `email debe ser único`() {
        // Arrange
        val usuario1 = Usuario(
            nombre = "Carlos",
            email = "duplicado@example.com",
            contraseña = "pass1"
        )
        val usuario2 = Usuario(
            nombre = "Ana",
            email = "duplicado@example.com",
            contraseña = "pass2"
        )

        usuarioRepository.save(usuario1)

        // Act & Assert
        assertThrows(Exception::class.java) {
            usuarioRepository.save(usuario2)
            usuarioRepository.flush() // Fuerza la violación de constraint
        }
    }


    /*    @Test
        fun `debe fallar si email es nulo o vacío`() {
            val usuario = Usuario(
                nombre = "Test",
                email = "",  // Email vacío
                contraseña = "pass"
            )

            assertThrows(Exception::class.java) {
                usuarioRepository.save(usuario)
                usuarioRepository.flush()
            }
        }

        @Test
        fun `debe fallar si nombre es nulo`() {
            val usuario = Usuario(
                nombre = "",
                email = "test@example.com",
                contraseña = "pass"
            )

            assertThrows(Exception::class.java) {
                usuarioRepository.save(usuario)
                usuarioRepository.flush()
            }
        }*/

    @Test
    fun `usuario recién creado debe estar activo por defecto`() {
        val usuario = Usuario(
            nombre = "Juan",
            email = "juan@example.com",
            contraseña = "pass"
        )

        val guardado = usuarioRepository.save(usuario)

        assertTrue(guardado.activo)
    }

    @Test
    fun `fechaRegistro debe setearse automáticamente`() {
        val antes = LocalDateTime.now()

        val usuario = Usuario(
            nombre = "Juan",
            email = "juan@example.com",
            contraseña = "pass"
        )

        val guardado = usuarioRepository.save(usuario)
        val despues = LocalDateTime.now()

        assertNotNull(guardado.fechaRegistro)
        assertTrue(guardado.fechaRegistro.isAfter(antes.minusSeconds(1)))
        assertTrue(guardado.fechaRegistro.isBefore(despues.plusSeconds(1)))
    }

    @Test
    fun `debe guardar usuario y asignar ID`() {
        val usuario = Usuario(
            nombre = "Juan",
            email = "juan@example.com",
            contraseña = "pass")
        val guardado = usuarioRepository.save(usuario)

        assertNotNull(guardado.id)
        assertTrue(guardado.id!! > 0)
    }

}