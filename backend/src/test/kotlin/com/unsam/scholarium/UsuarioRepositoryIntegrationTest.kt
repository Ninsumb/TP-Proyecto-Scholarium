/*
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.assertj.core.api.Assertions.assertThat
import kotlin.test.Test


@SpringBootTest
@ActiveProfiles("integration")
@Testcontainers  // Usa Docker para levantar PostgreSQL real
class UsuarioRepositoryIntegrationTest {

    companion object {
        @Container
        val postgres = PostgreSQLContainer<Nothing>("postgres:15-alpine").apply {
            withDatabaseName("testdb")
            withUsername("test")
            withPassword("test")
        }
    }

    @Autowired
    private lateinit var usuarioRepository: UsuarioRepository

    @Test
    fun `debe funcionar con PostgreSQL real`() {
        val usuario = Usuario(
            nombre = "Juan",
            email = "juan@example.com",
            contraseña = "pass"
        )
        val guardado = usuarioRepository.save(usuario)

        assertThat(guardado.id).isNotNull()
    }
}*/
