package com.unsam.scholarium.bootstrap

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import com.unsam.scholarium.model.*
import com.unsam.scholarium.repository.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
@Profile("!prod")
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


            // ═══════════════════════════════════════════════════════════════════════════════
            // BLOQUE 1 — USUARIOS
            // Pegar dentro del if (usuarioRepo.count() == 0L), al principio.
            // Reemplaza el bloque "// ── Usuarios ──" existente.
            // ═══════════════════════════════════════════════════════════════════════════════

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

// ── Cuentas especiales (existentes, no tocar) ─────────────────────────────────
            val nuevoAdmin = usuarioRepo.save(Usuario(
                nombre = "Admin", email = "admin@test.com",
                password = passwordEncoder.encode("1234")
            ))

            val admin = usuarioRepo.save(Usuario(
                nombre = "Valentino", email = "test@test.com",
                password = passwordEncoder.encode("1234")
            ))
            admin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/test.jpg", admin.id!!)
            usuarioRepo.save(admin)

            val admin2 = usuarioRepo.save(Usuario(
                nombre = "Pepita", email = "pepi@test.com",
                password = passwordEncoder.encode("1234")
            ))
            usuarioRepo.save(admin2)

            val solicitante = usuarioRepo.save(Usuario(
                nombre = "Juan García", email = "juan@test.com",
                password = passwordEncoder.encode("1234")
            ))
            solicitante.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/juan.jpg", solicitante.id!!)
            usuarioRepo.save(solicitante)

            val noAdmin = usuarioRepo.save(Usuario(
                nombre = "Pedro López", email = "pedro@test.com",
                password = passwordEncoder.encode("1234")
            ))
            noAdmin.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/pedro.jpg", noAdmin.id!!)
            usuarioRepo.save(noAdmin)

            val rechazado = usuarioRepo.save(Usuario(
                nombre = "María Fernández", email = "maria@test.com",
                password = passwordEncoder.encode("1234")
            ))
            usuarioRepo.save(rechazado)

            val bloqueado = usuarioRepo.save(Usuario(
                nombre = "Carlos Gomez", email = "carlos@test.com",
                password = passwordEncoder.encode("1234")
            ))
            usuarioRepo.save(bloqueado)

            val variasMembresias = usuarioRepo.save(Usuario(
                nombre = "José Vargas", email = "jose@test.com",
                password = passwordEncoder.encode("1234")
            ))
            variasMembresias.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/1.jpg", variasMembresias.id!!)
            usuarioRepo.save(variasMembresias)

            val visitante = usuarioRepo.save(Usuario(
                nombre = "Laura Visitante", email = "laura@test.com",
                password = passwordEncoder.encode("1234")
            ))
            usuarioRepo.save(visitante)

// ── Usuarios generales (142 más) ──────────────────────────────────────────────
// Foto: /bootstrap-assets/N.jpg donde N va de 1 a 110 (los primeros 100 tienen foto)

            val u001 = usuarioRepo.save(Usuario(nombre = "Sofía Ramírez",      email = "sofia.ramirez@scholarium.test",      password = passwordEncoder.encode("1234")))
            u001.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/2.jpg", u001.id!!); usuarioRepo.save(u001)

            val u002 = usuarioRepo.save(Usuario(nombre = "Matías Herrera",     email = "matias.herrera@scholarium.test",     password = passwordEncoder.encode("1234")))
            u002.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/3.jpg", u002.id!!); usuarioRepo.save(u002)

            val u003 = usuarioRepo.save(Usuario(nombre = "Valentina Torres",   email = "valentina.torres@scholarium.test",   password = passwordEncoder.encode("1234")))
            u003.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/4.jpg", u003.id!!); usuarioRepo.save(u003)

            val u004 = usuarioRepo.save(Usuario(nombre = "Lucas Moreno",       email = "lucas.moreno@scholarium.test",       password = passwordEncoder.encode("1234")))
            u004.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/5.jpg", u004.id!!); usuarioRepo.save(u004)

            val u005 = usuarioRepo.save(Usuario(nombre = "Camila Díaz",        email = "camila.diaz@scholarium.test",        password = passwordEncoder.encode("1234")))
            u005.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/6.jpg", u005.id!!); usuarioRepo.save(u005)

            val u006 = usuarioRepo.save(Usuario(nombre = "Ezequiel Ruiz",      email = "ezequiel.ruiz@scholarium.test",      password = passwordEncoder.encode("1234")))
            u006.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/7.jpg", u006.id!!); usuarioRepo.save(u006)

            val u007 = usuarioRepo.save(Usuario(nombre = "Lucía Álvarez",      email = "lucia.alvarez@scholarium.test",      password = passwordEncoder.encode("1234")))
            u007.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/8.jpg", u007.id!!); usuarioRepo.save(u007)

            val u008 = usuarioRepo.save(Usuario(nombre = "Ignacio Sosa",       email = "ignacio.sosa@scholarium.test",       password = passwordEncoder.encode("1234")))
            u008.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/9.jpg", u008.id!!); usuarioRepo.save(u008)

            val u009 = usuarioRepo.save(Usuario(nombre = "Agustina Romero",    email = "agustina.romero@scholarium.test",    password = passwordEncoder.encode("1234")))
            u009.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/10.jpg", u009.id!!); usuarioRepo.save(u009)

            val u010 = usuarioRepo.save(Usuario(nombre = "Facundo Castro",     email = "facundo.castro@scholarium.test",     password = passwordEncoder.encode("1234")))
            u010.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/11.jpg", u010.id!!); usuarioRepo.save(u010)

            val u011 = usuarioRepo.save(Usuario(nombre = "Micaela Ramos",      email = "micaela.ramos@scholarium.test",      password = passwordEncoder.encode("1234")))
            u011.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/12.jpg", u011.id!!); usuarioRepo.save(u011)

            val u012 = usuarioRepo.save(Usuario(nombre = "Nicolás Vega",       email = "nicolas.vega@scholarium.test",       password = passwordEncoder.encode("1234")))
            u012.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/13.jpg", u012.id!!); usuarioRepo.save(u012)

            val u013 = usuarioRepo.save(Usuario(nombre = "Florencia Núñez",    email = "florencia.nunez@scholarium.test",    password = passwordEncoder.encode("1234")))
            u013.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/14.jpg", u013.id!!); usuarioRepo.save(u013)

            val u014 = usuarioRepo.save(Usuario(nombre = "Santiago Medina",    email = "santiago.medina@scholarium.test",    password = passwordEncoder.encode("1234")))
            u014.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/15.jpg", u014.id!!); usuarioRepo.save(u014)

            val u015 = usuarioRepo.save(Usuario(nombre = "Julieta Acosta",     email = "julieta.acosta@scholarium.test",     password = passwordEncoder.encode("1234")))
            u015.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/16.jpg", u015.id!!); usuarioRepo.save(u015)

            val u016 = usuarioRepo.save(Usuario(nombre = "Tomás Giménez",      email = "tomas.gimenez@scholarium.test",      password = passwordEncoder.encode("1234")))
            u016.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/17.jpg", u016.id!!); usuarioRepo.save(u016)

            val u017 = usuarioRepo.save(Usuario(nombre = "Rocío Pereyra",      email = "rocio.pereyra@scholarium.test",      password = passwordEncoder.encode("1234")))
            u017.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/18.jpg", u017.id!!); usuarioRepo.save(u017)

            val u018 = usuarioRepo.save(Usuario(nombre = "Leandro Suárez",     email = "leandro.suarez@scholarium.test",     password = passwordEncoder.encode("1234")))
            u018.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/19.jpg", u018.id!!); usuarioRepo.save(u018)

            val u019 = usuarioRepo.save(Usuario(nombre = "Natalia Flores",     email = "natalia.flores@scholarium.test",     password = passwordEncoder.encode("1234")))
            u019.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/20.jpg", u019.id!!); usuarioRepo.save(u019)

            val u020 = usuarioRepo.save(Usuario(nombre = "Bruno Molina",       email = "bruno.molina@scholarium.test",       password = passwordEncoder.encode("1234")))
            u020.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/21.jpg", u020.id!!); usuarioRepo.save(u020)

            val u021 = usuarioRepo.save(Usuario(nombre = "Antonella Ríos",     email = "antonella.rios@scholarium.test",     password = passwordEncoder.encode("1234")))
            u021.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/22.jpg", u021.id!!); usuarioRepo.save(u021)

            val u022 = usuarioRepo.save(Usuario(nombre = "Mauro Benítez",      email = "mauro.benitez@scholarium.test",      password = passwordEncoder.encode("1234")))
            u022.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/23.jpg", u022.id!!); usuarioRepo.save(u022)

            val u023 = usuarioRepo.save(Usuario(nombre = "Carla Ortega",       email = "carla.ortega@scholarium.test",       password = passwordEncoder.encode("1234")))
            u023.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/24.jpg", u023.id!!); usuarioRepo.save(u023)

            val u024 = usuarioRepo.save(Usuario(nombre = "Rodrigo Peña",       email = "rodrigo.pena@scholarium.test",       password = passwordEncoder.encode("1234")))
            u024.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/25.jpg", u024.id!!); usuarioRepo.save(u024)

            val u025 = usuarioRepo.save(Usuario(nombre = "Celeste Domínguez",  email = "celeste.dominguez@scholarium.test",  password = passwordEncoder.encode("1234")))
            u025.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/26.jpg", u025.id!!); usuarioRepo.save(u025)

            val u026 = usuarioRepo.save(Usuario(nombre = "Martín Guerrero",    email = "martin.guerrero@scholarium.test",    password = passwordEncoder.encode("1234")))
            u026.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/27.jpg", u026.id!!); usuarioRepo.save(u026)

            val u027 = usuarioRepo.save(Usuario(nombre = "Agustín Rojas",      email = "agustin.rojas@scholarium.test",      password = passwordEncoder.encode("1234")))
            u027.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/28.jpg", u027.id!!); usuarioRepo.save(u027)

            val u028 = usuarioRepo.save(Usuario(nombre = "Belén Mendoza",      email = "belen.mendoza@scholarium.test",      password = passwordEncoder.encode("1234")))
            u028.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/29.jpg", u028.id!!); usuarioRepo.save(u028)

            val u029 = usuarioRepo.save(Usuario(nombre = "Gonzalo Silva",      email = "gonzalo.silva@scholarium.test",      password = passwordEncoder.encode("1234")))
            u029.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/30.jpg", u029.id!!); usuarioRepo.save(u029)

            val u030 = usuarioRepo.save(Usuario(nombre = "Luciana Vargas",     email = "luciana.vargas@scholarium.test",     password = passwordEncoder.encode("1234")))
            u030.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/31.jpg", u030.id!!); usuarioRepo.save(u030)

            val u031 = usuarioRepo.save(Usuario(nombre = "Emiliano Cabrera",   email = "emiliano.cabrera@scholarium.test",   password = passwordEncoder.encode("1234")))
            u031.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/32.jpg", u031.id!!); usuarioRepo.save(u031)

            val u032 = usuarioRepo.save(Usuario(nombre = "Paula Arias",        email = "paula.arias@scholarium.test",        password = passwordEncoder.encode("1234")))
            u032.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/33.jpg", u032.id!!); usuarioRepo.save(u032)

            val u033 = usuarioRepo.save(Usuario(nombre = "Damián Reyes",       email = "damian.reyes@scholarium.test",       password = passwordEncoder.encode("1234")))
            u033.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/34.jpg", u033.id!!); usuarioRepo.save(u033)

            val u034 = usuarioRepo.save(Usuario(nombre = "Valeria Sánchez",    email = "valeria.sanchez@scholarium.test",    password = passwordEncoder.encode("1234")))
            u034.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/35.jpg", u034.id!!); usuarioRepo.save(u034)

            val u035 = usuarioRepo.save(Usuario(nombre = "Cristian Ibáñez",    email = "cristian.ibanez@scholarium.test",    password = passwordEncoder.encode("1234")))
            u035.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/36.jpg", u035.id!!); usuarioRepo.save(u035)

            val u036 = usuarioRepo.save(Usuario(nombre = "Josefina Paredes",   email = "josefina.paredes@scholarium.test",   password = passwordEncoder.encode("1234")))
            u036.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/37.jpg", u036.id!!); usuarioRepo.save(u036)

            val u037 = usuarioRepo.save(Usuario(nombre = "Diego Villanueva",   email = "diego.villanueva@scholarium.test",   password = passwordEncoder.encode("1234")))
            u037.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/38.jpg", u037.id!!); usuarioRepo.save(u037)

            val u038 = usuarioRepo.save(Usuario(nombre = "Romina Espinoza",    email = "romina.espinoza@scholarium.test",    password = passwordEncoder.encode("1234")))
            u038.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/39.jpg", u038.id!!); usuarioRepo.save(u038)

            val u039 = usuarioRepo.save(Usuario(nombre = "Claudio Muñoz",      email = "claudio.munoz@scholarium.test",      password = passwordEncoder.encode("1234")))
            u039.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/40.jpg", u039.id!!); usuarioRepo.save(u039)

            val u040 = usuarioRepo.save(Usuario(nombre = "Verónica Lagos",     email = "veronica.lagos@scholarium.test",     password = passwordEncoder.encode("1234")))
            u040.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/41.jpg", u040.id!!); usuarioRepo.save(u040)

            val u041 = usuarioRepo.save(Usuario(nombre = "Hernán Fuentes",     email = "hernan.fuentes@scholarium.test",     password = passwordEncoder.encode("1234")))
            u041.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/42.jpg", u041.id!!); usuarioRepo.save(u041)

            val u042 = usuarioRepo.save(Usuario(nombre = "Daniela Aguirre",    email = "daniela.aguirre@scholarium.test",    password = passwordEncoder.encode("1234")))
            u042.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/43.jpg", u042.id!!); usuarioRepo.save(u042)

            val u043 = usuarioRepo.save(Usuario(nombre = "Federico Navarro",   email = "federico.navarro@scholarium.test",   password = passwordEncoder.encode("1234")))
            u043.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/44.jpg", u043.id!!); usuarioRepo.save(u043)

            val u044 = usuarioRepo.save(Usuario(nombre = "Silvana Ponce",      email = "silvana.ponce@scholarium.test",      password = passwordEncoder.encode("1234")))
            u044.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/45.jpg", u044.id!!); usuarioRepo.save(u044)

            val u045 = usuarioRepo.save(Usuario(nombre = "Esteban Salinas",    email = "esteban.salinas@scholarium.test",    password = passwordEncoder.encode("1234")))
            u045.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/46.jpg", u045.id!!); usuarioRepo.save(u045)

            val u046 = usuarioRepo.save(Usuario(nombre = "Alejandra Bravo",    email = "alejandra.bravo@scholarium.test",    password = passwordEncoder.encode("1234")))
            u046.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/47.jpg", u046.id!!); usuarioRepo.save(u046)

            val u047 = usuarioRepo.save(Usuario(nombre = "Pablo Tapia",        email = "pablo.tapia@scholarium.test",        password = passwordEncoder.encode("1234")))
            u047.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/48.jpg", u047.id!!); usuarioRepo.save(u047)

            val u048 = usuarioRepo.save(Usuario(nombre = "Karina Montoya",     email = "karina.montoya@scholarium.test",     password = passwordEncoder.encode("1234")))
            u048.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/49.jpg", u048.id!!); usuarioRepo.save(u048)

            val u049 = usuarioRepo.save(Usuario(nombre = "Ariel Sandoval",     email = "ariel.sandoval@scholarium.test",     password = passwordEncoder.encode("1234")))
            u049.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/50.jpg", u049.id!!); usuarioRepo.save(u049)

            val u050 = usuarioRepo.save(Usuario(nombre = "Natalia Ibarra",     email = "natalia.ibarra@scholarium.test",     password = passwordEncoder.encode("1234")))
            u050.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/51.jpg", u050.id!!); usuarioRepo.save(u050)

            val u051 = usuarioRepo.save(Usuario(nombre = "Maximiliano Cano",   email = "maxi.cano@scholarium.test",          password = passwordEncoder.encode("1234")))
            u051.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/52.jpg", u051.id!!); usuarioRepo.save(u051)

            val u052 = usuarioRepo.save(Usuario(nombre = "Lorena Vidal",       email = "lorena.vidal@scholarium.test",       password = passwordEncoder.encode("1234")))
            u052.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/53.jpg", u052.id!!); usuarioRepo.save(u052)

            val u053 = usuarioRepo.save(Usuario(nombre = "Gustavo Palacios",   email = "gustavo.palacios@scholarium.test",   password = passwordEncoder.encode("1234")))
            u053.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/54.jpg", u053.id!!); usuarioRepo.save(u053)

            val u054 = usuarioRepo.save(Usuario(nombre = "Adriana Campos",     email = "adriana.campos@scholarium.test",     password = passwordEncoder.encode("1234")))
            u054.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/55.jpg", u054.id!!); usuarioRepo.save(u054)

            val u055 = usuarioRepo.save(Usuario(nombre = "Jonathan Heredia",   email = "jonathan.heredia@scholarium.test",   password = passwordEncoder.encode("1234")))
            u055.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/56.jpg", u055.id!!); usuarioRepo.save(u055)

            val u056 = usuarioRepo.save(Usuario(nombre = "Vanesa Correa",      email = "vanesa.correa@scholarium.test",      password = passwordEncoder.encode("1234")))
            u056.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/57.jpg", u056.id!!); usuarioRepo.save(u056)

            val u057 = usuarioRepo.save(Usuario(nombre = "Sebastián Mora",     email = "sebastian.mora@scholarium.test",     password = passwordEncoder.encode("1234")))
            u057.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/58.jpg", u057.id!!); usuarioRepo.save(u057)

            val u058 = usuarioRepo.save(Usuario(nombre = "Paola Miranda",      email = "paola.miranda@scholarium.test",      password = passwordEncoder.encode("1234")))
            u058.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/59.jpg", u058.id!!); usuarioRepo.save(u058)

            val u059 = usuarioRepo.save(Usuario(nombre = "Rodrigo Valdés",     email = "rodrigo.valdes@scholarium.test",     password = passwordEncoder.encode("1234")))
            u059.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/60.jpg", u059.id!!); usuarioRepo.save(u059)

            val u060 = usuarioRepo.save(Usuario(nombre = "Carolina Méndez",    email = "carolina.mendez@scholarium.test",    password = passwordEncoder.encode("1234")))
            u060.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/61.jpg", u060.id!!); usuarioRepo.save(u060)

            val u061 = usuarioRepo.save(Usuario(nombre = "Jorge Estrada",      email = "jorge.estrada@scholarium.test",      password = passwordEncoder.encode("1234")))
            u061.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/62.jpg", u061.id!!); usuarioRepo.save(u061)

            val u062 = usuarioRepo.save(Usuario(nombre = "Cecilia Quiroga",    email = "cecilia.quiroga@scholarium.test",    password = passwordEncoder.encode("1234")))
            u062.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/63.jpg", u062.id!!); usuarioRepo.save(u062)

            val u063 = usuarioRepo.save(Usuario(nombre = "Andrés Rosales",     email = "andres.rosales@scholarium.test",     password = passwordEncoder.encode("1234")))
            u063.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/64.jpg", u063.id!!); usuarioRepo.save(u063)

            val u064 = usuarioRepo.save(Usuario(nombre = "Mariela Sepúlveda",  email = "mariela.sepulveda@scholarium.test",  password = passwordEncoder.encode("1234")))
            u064.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/65.jpg", u064.id!!); usuarioRepo.save(u064)

            val u065 = usuarioRepo.save(Usuario(nombre = "Gabriel Escobar",    email = "gabriel.escobar@scholarium.test",    password = passwordEncoder.encode("1234")))
            u065.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/66.jpg", u065.id!!); usuarioRepo.save(u065)

            val u066 = usuarioRepo.save(Usuario(nombre = "Tamara Figueroa",    email = "tamara.figueroa@scholarium.test",    password = passwordEncoder.encode("1234")))
            u066.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/67.jpg", u066.id!!); usuarioRepo.save(u066)

            val u067 = usuarioRepo.save(Usuario(nombre = "Ricardo Carrillo",   email = "ricardo.carrillo@scholarium.test",   password = passwordEncoder.encode("1234")))
            u067.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/68.jpg", u067.id!!); usuarioRepo.save(u067)

            val u068 = usuarioRepo.save(Usuario(nombre = "Soledad Pizarro",    email = "soledad.pizarro@scholarium.test",    password = passwordEncoder.encode("1234")))
            u068.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/69.jpg", u068.id!!); usuarioRepo.save(u068)

            val u069 = usuarioRepo.save(Usuario(nombre = "Ramiro Gallego",     email = "ramiro.gallego@scholarium.test",     password = passwordEncoder.encode("1234")))
            u069.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/70.jpg", u069.id!!); usuarioRepo.save(u069)

            val u070 = usuarioRepo.save(Usuario(nombre = "Elena Carvajal",     email = "elena.carvajal@scholarium.test",     password = passwordEncoder.encode("1234")))
            u070.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/71.jpg", u070.id!!); usuarioRepo.save(u070)

            val u071 = usuarioRepo.save(Usuario(nombre = "Mauricio Blanco",    email = "mauricio.blanco@scholarium.test",    password = passwordEncoder.encode("1234")))
            u071.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/72.jpg", u071.id!!); usuarioRepo.save(u071)

            val u072 = usuarioRepo.save(Usuario(nombre = "Pilar Naranjo",      email = "pilar.naranjo@scholarium.test",      password = passwordEncoder.encode("1234")))
            u072.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/73.jpg", u072.id!!); usuarioRepo.save(u072)

            val u073 = usuarioRepo.save(Usuario(nombre = "Javier Delgado",     email = "javier.delgado@scholarium.test",     password = passwordEncoder.encode("1234")))
            u073.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/74.jpg", u073.id!!); usuarioRepo.save(u073)

            val u074 = usuarioRepo.save(Usuario(nombre = "Claudia Rondón",     email = "claudia.rondon@scholarium.test",     password = passwordEncoder.encode("1234")))
            u074.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/75.jpg", u074.id!!); usuarioRepo.save(u074)

            val u075 = usuarioRepo.save(Usuario(nombre = "Iván Contreras",     email = "ivan.contreras@scholarium.test",     password = passwordEncoder.encode("1234")))
            u075.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/76.jpg", u075.id!!); usuarioRepo.save(u075)

            val u076 = usuarioRepo.save(Usuario(nombre = "Yanina Cordero",     email = "yanina.cordero@scholarium.test",     password = passwordEncoder.encode("1234")))
            u076.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/77.jpg", u076.id!!); usuarioRepo.save(u076)

            val u077 = usuarioRepo.save(Usuario(nombre = "Elías Rincón",       email = "elias.rincon@scholarium.test",       password = passwordEncoder.encode("1234")))
            u077.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/78.jpg", u077.id!!); usuarioRepo.save(u077)

            val u078 = usuarioRepo.save(Usuario(nombre = "Fernanda Moya",      email = "fernanda.moya@scholarium.test",      password = passwordEncoder.encode("1234")))
            u078.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/79.jpg", u078.id!!); usuarioRepo.save(u078)

            val u079 = usuarioRepo.save(Usuario(nombre = "Héctor Serrano",     email = "hector.serrano@scholarium.test",     password = passwordEncoder.encode("1234")))
            u079.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/80.jpg", u079.id!!); usuarioRepo.save(u079)

            val u080 = usuarioRepo.save(Usuario(nombre = "Cintia Palomino",    email = "cintia.palomino@scholarium.test",    password = passwordEncoder.encode("1234")))
            u080.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/81.jpg", u080.id!!); usuarioRepo.save(u080)

            val u081 = usuarioRepo.save(Usuario(nombre = "Walter Noriega",     email = "walter.noriega@scholarium.test",     password = passwordEncoder.encode("1234")))
            u081.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/82.jpg", u081.id!!); usuarioRepo.save(u081)

            val u082 = usuarioRepo.save(Usuario(nombre = "Marcela Duarte",     email = "marcela.duarte@scholarium.test",     password = passwordEncoder.encode("1234")))
            u082.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/83.jpg", u082.id!!); usuarioRepo.save(u082)

            val u083 = usuarioRepo.save(Usuario(nombre = "Patricio Arenas",    email = "patricio.arenas@scholarium.test",    password = passwordEncoder.encode("1234")))
            u083.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/84.jpg", u083.id!!); usuarioRepo.save(u083)

            val u084 = usuarioRepo.save(Usuario(nombre = "Graciela Soto",      email = "graciela.soto@scholarium.test",      password = passwordEncoder.encode("1234")))
            u084.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/85.jpg", u084.id!!); usuarioRepo.save(u084)

            val u085 = usuarioRepo.save(Usuario(nombre = "Osvaldo Vera",       email = "osvaldo.vera@scholarium.test",       password = passwordEncoder.encode("1234")))
            u085.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/86.jpg", u085.id!!); usuarioRepo.save(u085)

            val u086 = usuarioRepo.save(Usuario(nombre = "Liliana Barros",     email = "liliana.barros@scholarium.test",     password = passwordEncoder.encode("1234")))
            u086.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/87.jpg", u086.id!!); usuarioRepo.save(u086)

            val u087 = usuarioRepo.save(Usuario(nombre = "Enrique Trujillo",   email = "enrique.trujillo@scholarium.test",   password = passwordEncoder.encode("1234")))
            u087.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/88.jpg", u087.id!!); usuarioRepo.save(u087)

            val u088 = usuarioRepo.save(Usuario(nombre = "Beatriz Meza",       email = "beatriz.meza@scholarium.test",       password = passwordEncoder.encode("1234")))
            u088.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/89.jpg", u088.id!!); usuarioRepo.save(u088)

            val u089 = usuarioRepo.save(Usuario(nombre = "Roberto Orozco",     email = "roberto.orozco@scholarium.test",     password = passwordEncoder.encode("1234")))
            u089.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/90.jpg", u089.id!!); usuarioRepo.save(u089)

            val u090 = usuarioRepo.save(Usuario(nombre = "Ana Leal",           email = "ana.leal@scholarium.test",           password = passwordEncoder.encode("1234")))
            u090.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/91.jpg", u090.id!!); usuarioRepo.save(u090)

            val u091 = usuarioRepo.save(Usuario(nombre = "Darío Zamora",       email = "dario.zamora@scholarium.test",       password = passwordEncoder.encode("1234")))
            u091.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/92.jpg", u091.id!!); usuarioRepo.save(u091)

            val u092 = usuarioRepo.save(Usuario(nombre = "Viviana Palma",      email = "viviana.palma@scholarium.test",      password = passwordEncoder.encode("1234")))
            u092.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/93.jpg", u092.id!!); usuarioRepo.save(u092)

            val u093 = usuarioRepo.save(Usuario(nombre = "Álvaro Chávez",      email = "alvaro.chavez@scholarium.test",      password = passwordEncoder.encode("1234")))
            u093.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/94.jpg", u093.id!!); usuarioRepo.save(u093)

            val u094 = usuarioRepo.save(Usuario(nombre = "Isabel Cárdenas",    email = "isabel.cardenas@scholarium.test",    password = passwordEncoder.encode("1234")))
            u094.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/95.jpg", u094.id!!); usuarioRepo.save(u094)

            val u095 = usuarioRepo.save(Usuario(nombre = "Felipe Villalba",    email = "felipe.villalba@scholarium.test",    password = passwordEncoder.encode("1234")))
            u095.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/96.jpg", u095.id!!); usuarioRepo.save(u095)

            val u096 = usuarioRepo.save(Usuario(nombre = "Miriam Espejo",      email = "miriam.espejo@scholarium.test",      password = passwordEncoder.encode("1234")))
            u096.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/97.jpg", u096.id!!); usuarioRepo.save(u096)

            val u097 = usuarioRepo.save(Usuario(nombre = "Raúl Acevedo",       email = "raul.acevedo@scholarium.test",       password = passwordEncoder.encode("1234")))
            u097.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/98.jpg", u097.id!!); usuarioRepo.save(u097)

            val u098 = usuarioRepo.save(Usuario(nombre = "Alicia Briones",     email = "alicia.briones@scholarium.test",     password = passwordEncoder.encode("1234")))
            u098.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/99.jpg", u098.id!!); usuarioRepo.save(u098)

            val u099 = usuarioRepo.save(Usuario(nombre = "Mario Fuenzalida",   email = "mario.fuenzalida@scholarium.test",   password = passwordEncoder.encode("1234")))
            u099.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/100.jpg", u099.id!!); usuarioRepo.save(u099)

            val u100 = usuarioRepo.save(Usuario(nombre = "Rosa Tello",         email = "rosa.tello@scholarium.test",         password = passwordEncoder.encode("1234")))
            u100.fotoPerfil = subirFotoBootstrap("/bootstrap-assets/101.jpg", u100.id!!); usuarioRepo.save(u100)

// Sin foto (u101–u142)
            val u101 = usuarioRepo.save(Usuario(nombre = "Néstor Quispe",      email = "nestor.quispe@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u102 = usuarioRepo.save(Usuario(nombre = "Liliana Montero",    email = "liliana.montero@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u103 = usuarioRepo.save(Usuario(nombre = "Augusto Ríos",       email = "augusto.rios@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u104 = usuarioRepo.save(Usuario(nombre = "Florencia Leiva",    email = "florencia.leiva@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u105 = usuarioRepo.save(Usuario(nombre = "Xavier Andrade",     email = "xavier.andrade@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u106 = usuarioRepo.save(Usuario(nombre = "Patricia Alarcón",   email = "patricia.alarcon@scholarium.test",   password = passwordEncoder.encode("1234")))
            val u107 = usuarioRepo.save(Usuario(nombre = "Cristóbal Salas",    email = "cristobal.salas@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u108 = usuarioRepo.save(Usuario(nombre = "Antonia Fuente",     email = "antonia.fuente@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u109 = usuarioRepo.save(Usuario(nombre = "Gerardo Ahumada",    email = "gerardo.ahumada@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u110 = usuarioRepo.save(Usuario(nombre = "Constanza Ibacache", email = "constanza.ibacache@scholarium.test", password = passwordEncoder.encode("1234")))
            val u111 = usuarioRepo.save(Usuario(nombre = "Omar Garrido",       email = "omar.garrido@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u112 = usuarioRepo.save(Usuario(nombre = "Francisca Uribe",    email = "francisca.uribe@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u113 = usuarioRepo.save(Usuario(nombre = "Emilio Tagle",       email = "emilio.tagle@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u114 = usuarioRepo.save(Usuario(nombre = "Renata Venegas",     email = "renata.venegas@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u115 = usuarioRepo.save(Usuario(nombre = "Claudio Poblete",    email = "claudio.poblete@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u116 = usuarioRepo.save(Usuario(nombre = "Ximena Cofré",       email = "ximena.cofre@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u117 = usuarioRepo.save(Usuario(nombre = "Rodrigo Muñante",    email = "rodrigo.munante@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u118 = usuarioRepo.save(Usuario(nombre = "Alejandro Pasten",   email = "alejandro.pasten@scholarium.test",   password = passwordEncoder.encode("1234")))
            val u119 = usuarioRepo.save(Usuario(nombre = "Susana Godoy",       email = "susana.godoy@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u120 = usuarioRepo.save(Usuario(nombre = "Leonardo Friz",      email = "leonardo.friz@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u121 = usuarioRepo.save(Usuario(nombre = "Daniela Zamorano",   email = "daniela.zamorano@scholarium.test",   password = passwordEncoder.encode("1234")))
            val u122 = usuarioRepo.save(Usuario(nombre = "Eduardo Pérez",      email = "eduardo.perez@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u123 = usuarioRepo.save(Usuario(nombre = "Gabriela Rossel",    email = "gabriela.rossel@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u124 = usuarioRepo.save(Usuario(nombre = "Nicolás Araneda",    email = "nicolas.araneda@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u125 = usuarioRepo.save(Usuario(nombre = "Alejandra Ramos",    email = "alejandra.ramos@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u126 = usuarioRepo.save(Usuario(nombre = "Andrés Vilches",     email = "andres.vilches@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u127 = usuarioRepo.save(Usuario(nombre = "Sandra Carrasco",    email = "sandra.carrasco@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u128 = usuarioRepo.save(Usuario(nombre = "Jorge Bustos",       email = "jorge.bustos@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u129 = usuarioRepo.save(Usuario(nombre = "Carmen Valdivia",    email = "carmen.valdivia@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u130 = usuarioRepo.save(Usuario(nombre = "Ignacio Zenteno",    email = "ignacio.zenteno@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u131 = usuarioRepo.save(Usuario(nombre = "Bárbara Espinosa",   email = "barbara.espinosa@scholarium.test",   password = passwordEncoder.encode("1234")))
            val u132 = usuarioRepo.save(Usuario(nombre = "Rodrigo Concha",     email = "rodrigo.concha@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u133 = usuarioRepo.save(Usuario(nombre = "Victoria Henríquez", email = "victoria.henriquez@scholarium.test", password = passwordEncoder.encode("1234")))
            val u134 = usuarioRepo.save(Usuario(nombre = "Felipe Quiroz",      email = "felipe.quiroz@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u135 = usuarioRepo.save(Usuario(nombre = "Andrea Baeza",       email = "andrea.baeza@scholarium.test",       password = passwordEncoder.encode("1234")))
            val u136 = usuarioRepo.save(Usuario(nombre = "Nelson Alvarado",    email = "nelson.alvarado@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u137 = usuarioRepo.save(Usuario(nombre = "Patricia Jara",      email = "patricia.jara@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u138 = usuarioRepo.save(Usuario(nombre = "Tomás Cáceres",      email = "tomas.caceres@scholarium.test",      password = passwordEncoder.encode("1234")))
            val u139 = usuarioRepo.save(Usuario(nombre = "Marcelo Guzmán",     email = "marcelo.guzman@scholarium.test",     password = passwordEncoder.encode("1234")))
            val u140 = usuarioRepo.save(Usuario(nombre = "Isidora Vergara",    email = "isidora.vergara@scholarium.test",    password = passwordEncoder.encode("1234")))
            val u141 = usuarioRepo.save(Usuario(nombre = "Gonzalo Pedreros",   email = "gonzalo.pedreros@scholarium.test",   password = passwordEncoder.encode("1234")))
            val u142 = usuarioRepo.save(Usuario(nombre = "Paula Rojas",        email = "paula.rojas@scholarium.test",        password = passwordEncoder.encode("1234")))

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

            // ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 2 — PORTALES NUEVOS (10 adicionales)
// Pegar DESPUÉS de los portales existentes (portalUADE), ANTES de las membresías.
// ═══════════════════════════════════════════════════════════════════════════════

// Portales existentes — mantenerlos tal cual, solo actualizamos las descripciones faltantes.
// Abrí tu bloque de portales existente y actualizá las descripciones de estos:
//   portalEspacial → descripcion = "Portal de la Licenciatura en Ingeniería Espacial de la UNSAM..."  (ver abajo)
//   portalAlimentos → descripcion = "Portal de la carrera de Ingeniería en Alimentos..."
//   portalElectronica → descripcion = "Portal de la Ingeniería Electrónica de la UTN..."
//   portalInformaticaUTN → descripcion = "Portal de la Ingeniería Informática de la UTN..."
//   portalUADE → descripcion = "Portal de estudiantes de UADE..."
//
// Si no querés tocar el código existente, podés hacer portalEspacial.descripcion = "..." después del save.
// Ej:
//   portalEspacial.descripcion = "Portal de la Licenciatura en Ingeniería Espacial de la UNSAM. ..."
//   portalRepo.save(portalEspacial)
// ──────────────────────────────────────────────────────────────────────────────

// ACTUALIZACIÓN de descripciones de portales sin texto bueno
            val portalEspacialDesc = "Portal de la Licenciatura en Ingeniería Espacial de la UNSAM, la única carrera universitaria de ingeniería espacial de Argentina. Forma profesionales capaces de diseñar, desarrollar y operar vehículos, instrumentos y sistemas espaciales, con una sólida base en mecánica, electrónica, propulsión y dinámica orbital. Aquí encontrarás materiales, recursos y discusiones sobre lanzadores, satélites, misiones científicas y tecnologías aeroespaciales."
            portalEspacial.descripcion = portalEspacialDesc; portalRepo.save(portalEspacial)

            val portalAlimentosDesc = "Portal de la Ingeniería en Alimentos de la UNSAM. La carrera forma profesionales que integran conocimientos de química, biología, microbiología y procesos industriales para diseñar, controlar y optimizar la producción de alimentos seguros y de calidad. Se abordan temas como tecnología de conservación, bromatología, control de calidad, packaging y normativa alimentaria vigente."
            portalAlimentos.descripcion = portalAlimentosDesc; portalRepo.save(portalAlimentos)

            val portalElectronicaDesc = "Portal de la Ingeniería Electrónica de la UTN — Facultad Regional Buenos Aires. La carrera abarca el diseño, análisis y desarrollo de sistemas electrónicos y de comunicaciones, con énfasis en señales, circuitos integrados, microcontroladores, sistemas embebidos y telecomunicaciones. Un espacio para compartir apuntes, parciales, proyectos y dudas técnicas con toda la comunidad."
            portalElectronica.descripcion = portalElectronicaDesc; portalRepo.save(portalElectronica)

            val portalInformaticaUTNDesc = "Portal de la Ingeniería Informática de la UTN — Facultad Regional Buenos Aires. Una carrera de alta demanda que forma ingenieros con sólida formación matemática, algorítmica y de sistemas, orientada al desarrollo de software, arquitecturas de sistemas, redes y gestión de proyectos tecnológicos. Compartí recursos, consultá dudas y conectate con pares de toda la facultad."
            portalInformaticaUTN.descripcion = portalInformaticaUTNDesc; portalRepo.save(portalInformaticaUTN)

            val portalUADEDesc = "Portal de estudiantes de la UADE — Universidad Argentina de la Empresa. Espacio interdisciplinario para alumnos de distintas carreras que quieran compartir materiales, coordinar grupos de estudio, discutir temas académicos y mantenerse al tanto de las novedades institucionales. Ideal para conectarse con compañeros más allá de la carrera y la sede."
            portalUADE.descripcion = portalUADEDesc; portalRepo.save(portalUADE)

// ── Portales nuevos ────────────────────────────────────────────────────────────

            val portalBiotecnologia = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Licenciatura en Biotecnología",
                unidadAcademica = "Escuela de Ciencia y Tecnología",
                descripcion = "Comunidad de la Licenciatura en Biotecnología de la UNSAM. La carrera combina biología molecular, bioquímica, microbiología e ingeniería de procesos para formar profesionales capaces de desarrollar, producir y controlar bioproductos en sectores como la salud, la agroindustria y el medioambiente. Encontrarás materiales sobre técnicas de laboratorio, bioreactores, genómica, proteómica y bioinformática, entre otros.",
                iconoPortal = "Dna",
                colorPortal = "#16A34A",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalQuimica = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Licenciatura en Química",
                unidadAcademica = "Facultad de Ciencias Exactas y Naturales",
                descripcion = "Portal de la Licenciatura en Química de la FCEyN-UBA. La carrera brinda formación profunda en química orgánica, inorgánica, física y analítica, con fuerte componente de laboratorio e investigación. Se trabajan temas como síntesis química, espectroscopía, cinética, termodinámica y métodos computacionales aplicados a la química. Un espacio para compartir apuntes, guías y experiencias de cursada.",
                iconoPortal = "FlaskConical",
                colorPortal = "#9333EA",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalMedicina = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Medicina",
                unidadAcademica = "Facultad de Medicina",
                descripcion = "Portal de la carrera de Medicina de la UBA. Comunidad para estudiantes de una de las carreras más exigentes y demandantes del país. Aquí se comparten apuntes de anatomía, fisiología, farmacología, clínica médica, pediatría, cirugía y todas las especialidades que atraviesan la formación médica. También, experiencias de residencias, guardias y el camino hacia el MIR interno.",
                iconoPortal = "Stethoscope",
                colorPortal = "#DC2626",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalArquitectura = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Arquitectura",
                unidadAcademica = "Facultad de Arquitectura, Diseño y Urbanismo",
                descripcion = "Portal de la carrera de Arquitectura de la FADU-UBA. Espacio de intercambio para estudiantes que transitan una carrera que integra creatividad, técnica y compromiso social. Se comparten láminas, referentes, bibliografía de historia y teoría de la arquitectura, materiales de estructuras, instalaciones e impresión. También debates sobre ciudad, vivienda y diseño urbano.",
                iconoPortal = "Building2",
                colorPortal = "#EA580C",
                tipoAcceso = TipoAcceso.ABIERTO,
            ))

            val portalAdministracion = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Licenciatura en Administración de Empresas",
                unidadAcademica = "Escuela de Economía y Negocios",
                descripcion = "Portal de la Licenciatura en Administración de Empresas de la UNSAM. La carrera forma profesionales con capacidad para gestionar organizaciones públicas y privadas, tomar decisiones estratégicas y adaptarse a entornos complejos y cambiantes. Los contenidos abarcan contabilidad, finanzas, marketing, recursos humanos, logística, derecho empresarial y gestión de proyectos.",
                iconoPortal = "Briefcase",
                colorPortal = "#0284C7",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalPsicologia = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Psicología",
                unidadAcademica = "Facultad de Psicología",
                descripcion = "Portal de la carrera de Psicología de la UBA. Comunidad para estudiantes de una carrera que aborda el comportamiento humano desde múltiples perspectivas: psicoanálisis, cognitivismo, neurociencias, psicología social y clínica. Se comparten resúmenes, bibliografía obligatoria, apuntes de teóricos y prácticos, y recursos para las rotaciones clínicas.",
                iconoPortal = "Brain",
                colorPortal = "#7C3AED",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalDerechoUBA = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Abogacía",
                unidadAcademica = "Facultad de Derecho",
                descripcion = "Portal de la carrera de Abogacía de la UBA. Espacio para estudiantes que cursan una de las facultades más grandes del país. Se comparten resúmenes de derecho civil, comercial, penal, constitucional, administrativo y procesal, fallos jurisprudenciales, guías de estudio y recursos para rendir el CBC. También noticias sobre el mundo jurídico y concursos académicos.",
                iconoPortal = "Scale",
                colorPortal = "#1E40AF",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalFisica = portalRepo.save(Portal(
                universidad = "Universidad Nacional de La Plata",
                carrera = "Licenciatura en Física",
                unidadAcademica = "Facultad de Ciencias Exactas",
                descripcion = "Portal de la Licenciatura en Física de la UNLP. La carrera forma investigadores y profesionales con sólida base matemática y experimental en mecánica clásica, termodinámica, electromagnetismo, mecánica cuántica y física estadística. También cubre áreas como óptica, física nuclear y cosmología. Ideal para compartir materiales de cursada e investigación.",
                iconoPortal = "Atom",
                colorPortal = "#0891B2",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            val portalDisenio = portalRepo.save(Portal(
                universidad = "Universidad de Buenos Aires",
                carrera = "Diseño Gráfico",
                unidadAcademica = "Facultad de Arquitectura, Diseño y Urbanismo",
                descripcion = "Portal de la carrera de Diseño Gráfico de la FADU-UBA. Comunidad para estudiantes que integran creatividad, comunicación visual y tecnología. Se comparten recursos tipográficos, trabajos prácticos, bibliografía de teoría del color y diseño editorial, tutoriales de herramientas como Illustrator, Figma e InDesign, y debates sobre el campo profesional del diseño.",
                iconoPortal = "Palette",
                colorPortal = "#DB2777",
                tipoAcceso = TipoAcceso.ABIERTO,
            ))

            val portalContabilidad = portalRepo.save(Portal(
                universidad = "Universidad Nacional de San Martín",
                carrera = "Contador Público Nacional",
                unidadAcademica = "Escuela de Economía y Negocios",
                descripcion = "Portal de la carrera de Contador Público Nacional de la UNSAM. La carrera prepara profesionales en contabilidad, auditoría, impuestos y finanzas, con visión integral de los sistemas de información y control organizacional. Aquí encontrarás materiales de contabilidad general, costos, impuestos nacionales y provinciales, auditoría y legislación comercial y laboral.",
                iconoPortal = "Calculator",
                colorPortal = "#065F46",
                tipoAcceso = TipoAcceso.CERRADO,
            ))

            // ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 3 — PLANTILLAS DE SOLICITUD
// Reemplaza el bloque "// ── PlantillaSolicitud ──" existente.
// Pegar DESPUÉS de los portales, ANTES de las membresías.
// ═══════════════════════════════════════════════════════════════════════════════

// TPI — ya tiene texto, lo dejamos pero mejorado
            plantillaRepo.save(PlantillaSolicitud(
                portal = portal,
                requisitos = "¡Bienvenido al portal de la Tecnicatura en Programación Informática de la UNSAM!\n\nPara unirte, por favor completá los siguientes datos en tu solicitud:\n\n1. Tu nombre y apellido completo.\n2. En qué año y cuatrimestre de la carrera estás actualmente.\n3. Si sos alumno regular, ingresante o egresado reciente.\n4. (Opcional) Si tenés experiencia previa en programación o proyectos que quieras mencionar.\n\nEl equipo de administración revisará tu solicitud a la brevedad. Las solicitudes sin información suficiente pueden ser rechazadas.",
                abierta = true,
            ))

// Redes
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalRedes,
                requisitos = "Para unirte al portal de Tecnicatura en Redes Informáticas de la UNSAM, necesitamos que incluyas en tu mensaje:\n\n• Nombre completo y año de cursada.\n• Si actualmente cursás materias relacionadas con redes (cuáles).\n• Breve descripción de por qué querés participar del portal.\n\nSi sos egresado o profesional del área, también podés indicarlo. Las solicitudes de personas ajenas a la carrera serán evaluadas caso por caso.",
                abierta = true,
            ))

// Datos
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalDatos,
                requisitos = "Portal de la Licenciatura en Ciencias de Datos — UNSAM.\n\nPara aprobar tu solicitud, contanos:\n\n1. Nombre completo y año de cursada.\n2. Materias que ya aprobaste (especialmente las de programación y estadística).\n3. Si tenés experiencia con Python, R, pandas o herramientas similares.\n4. Qué esperás encontrar en el portal y cómo pensás contribuir.\n\nEste portal es un espacio académico: las solicitudes genéricas o sin información serán rechazadas automáticamente.",
                abierta = true,
            ))

// Espacial
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalEspacial,
                requisitos = "Para unirte al portal de Ingeniería Espacial de la UNSAM, completá tu solicitud con:\n\n• Nombre completo.\n• Año de cursada y materias en curso.\n• Una breve presentación: ¿qué te llevó a elegir esta carrera?\n• (Opcional) Proyectos, trabajos o actividades extracurriculares relacionadas con el área espacial o aeronáutica.\n\nEste portal está orientado exclusivamente a estudiantes y egresados de la carrera. Solicitudes de personas ajenas a la carrera no serán aceptadas.",
                abierta = true,
            ))

// Alimentos
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalAlimentos,
                requisitos = "¡Bienvenido al portal de Ingeniería en Alimentos!\n\nPara procesar tu solicitud necesitamos:\n\n1. Nombre completo.\n2. Año y cuatrimestre en curso.\n3. ¿Tenés laboratorios activos este cuatrimestre? ¿Cuáles?\n4. (Opcional) ¿Hay algún tema específico sobre el que querés encontrar material o discutir en el foro?\n\nEl portal es moderno y todavía estamos cargando contenido — toda contribución es bienvenida.",
                abierta = true,
            ))

// Electrónica UTN
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalElectronica,
                requisitos = "Portal de Ingeniería Electrónica — UTN FRBA.\n\nPara aceptar tu solicitud, necesitamos que nos cuentes:\n\n• Nombre completo y legajo UTN.\n• Año de cursada y materias del cuatrimestre actual.\n• Área de mayor interés: señales y sistemas, electrónica de potencia, telecomunicaciones, embebidos, etc.\n\nLos estudiantes de otras facultades regionales de la UTN también son bienvenidos, pero indicá tu sede.",
                abierta = true,
            ))

// Informática UTN
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalInformaticaUTN,
                requisitos = "Portal de Ingeniería Informática — UTN FRBA.\n\nCompletá tu solicitud con:\n\n1. Nombre completo y legajo.\n2. Año de la carrera y materias actuales.\n3. Si tenés conocimiento de algún lenguaje, framework o área particular de interés.\n4. Cómo te enteraste de este portal.\n\nSi sos de UTN pero de otra facultad regional, también podés unirte: indicá tu sede y carrera.",
                abierta = true,
            ))

// UADE
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalUADE,
                requisitos = "Portal interdisciplinario para estudiantes de la UADE.\n\nPara unirte, contanos:\n\n• Tu nombre completo.\n• Carrera y año que cursás.\n• ¿Qué tipo de contenido o discusiones esperás encontrar en el portal?\n\nEste es un espacio abierto a estudiantes de todas las facultades de la UADE. Si ya egresaste y querés seguir participando, también podés solicitarlo indicando tu carrera y año de egreso.",
                abierta = true,
            ))

// Nuevos portales
            plantillaRepo.save(PlantillaSolicitud(
                portal = portalBiotecnologia,
                requisitos = "¡Bienvenido al portal de Biotecnología de la UNSAM!\n\nPara procesar tu solicitud, necesitamos:\n\n1. Nombre completo.\n2. Año de cursada y laboratorios activos.\n3. ¿Tenés experiencia previa en trabajo de laboratorio (institucional, voluntariado, etc.)?\n4. ¿Qué áreas de la biotecnología te interesan más: salud humana, agrobiotecnología, bioinformática, otra?\n\nEl portal tiene un fuerte componente de recursos de laboratorio. Las contribuciones de protocolos y guías propias son muy valoradas.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalQuimica,
                requisitos = "Portal de Licenciatura en Química — FCEyN UBA.\n\nPara unirte, completá con:\n\n• Nombre completo y padrón UBA.\n• Año de cursada y materias del cuatrimestre.\n• (Opcional) Si participás en algún grupo de investigación o pasantía.\n\nEste portal es para estudiantes activos de la carrera. Si ya egresaste y querés seguir contribuyendo con material, podemos evaluarlo.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalMedicina,
                requisitos = "Portal de Medicina — Facultad de Medicina UBA.\n\nDado el volumen de estudiantes y la sensibilidad del material, necesitamos verificar tu pertenencia a la facultad:\n\n1. Nombre completo y DNI (solo para verificación, no se almacena públicamente).\n2. Año de la carrera.\n3. ¿Estás cursando el CBC, el ciclo biomédico o el ciclo clínico?\n4. Número de libreta universitaria (si ya te inscribiste en la facultad).\n\nSolicitudes sin información completa serán rechazadas.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalArquitectura,
                requisitos = "Portal de Arquitectura — FADU UBA.\n\nPara unirte necesitamos:\n\n• Nombre completo y padrón.\n• Año de cursada.\n• Taller que cursás (si aplica).\n• Breve descripción de qué tipo de material esperás aportar o encontrar.\n\nEste es un portal abierto en términos de lectura — cualquier usuario puede ver el contenido. Pero para subir material o participar del foro, necesitás ser miembro verificado.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalAdministracion,
                requisitos = "Portal de Administración de Empresas — UNSAM.\n\nPara aprobar tu solicitud:\n\n1. Nombre completo.\n2. Año de cursada.\n3. ¿Tenés experiencia laboral relacionada con la carrera? (Opcional, pero enriquece la comunidad.)\n4. ¿Qué áreas de la administración te interesan más?\n\nSolicitudes de profesionales ya egresados son bienvenidas si quieren contribuir con su experiencia.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalPsicologia,
                requisitos = "Portal de Psicología — Facultad de Psicología UBA.\n\nPara procesar tu solicitud:\n\n• Nombre completo y padrón.\n• Año de cursada (1° a 5°, o si ya egresaste).\n• ¿Qué orientación o área te interesa más: clínica, social, educacional, laboral, neuropsicología?\n• Breve descripción de por qué querés ser parte de este portal.\n\nEste espacio respeta la diversidad de perspectivas teóricas. Toda discusión académica seria es bienvenida.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalDerechoUBA,
                requisitos = "Portal de Abogacía — Facultad de Derecho UBA.\n\nNecesitamos:\n\n1. Nombre completo y padrón UBA.\n2. Si cursás el CBC o ya estás en la Facultad de Derecho.\n3. Materias actuales o área de especialidad si ya estás avanzado.\n4. ¿Participás en algún organismo estudiantil, revista jurídica o concurso?\n\nEste portal tiene material sensible (fallos, textos legales). Por eso verificamos que los miembros pertenezcan a la comunidad académica.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalFisica,
                requisitos = "Portal de Licenciatura en Física — UNLP.\n\nPara unirte:\n\n• Nombre completo.\n• Año de cursada.\n• Orientación de interés (experimental, teórica, astrofísica, física de partículas, etc.).\n• Si participás en algún grupo de investigación o extensión (opcional).\n\nEste portal tiene fuerte vocación de comunidad científica. Se valoran los aportes de material original y las discusiones técnicas.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalDisenio,
                requisitos = "Portal de Diseño Gráfico — FADU UBA.\n\nPortal de acceso abierto: cualquier usuario puede leer y ver el contenido. Para aportar material o participar del foro:\n\n1. Nombre completo.\n2. Año de cursada o área de ejercicio profesional (si ya egresaste).\n3. ¿Qué herramientas usás? (Illustrator, Figma, InDesign, Procreate, etc.)\n\nLas comunidades de diseño se nutren de la crítica constructiva. Se aplican las normas de convivencia del portal.",
                abierta = true,
            ))

            plantillaRepo.save(PlantillaSolicitud(
                portal = portalContabilidad,
                requisitos = "Portal de Contador Público Nacional — UNSAM.\n\nPara procesar tu solicitud:\n\n1. Nombre completo.\n2. Año de cursada.\n3. ¿Ya rendiste alguna materia de impuestos o auditoría? Si es así, ¿cuáles?\n4. (Opcional) ¿Trabajás en estudio contable, empresa o administración pública?\n\nEl portal tiene material técnico específico. Los aportes de estudiantes avanzados y profesionales con matrícula activa son especialmente bienvenidos.",
                abierta = true,
            ))

            // ═══════════════════════════════════════════════════════════════════════════════
            // BLOQUE 4 — MEMBRESÍAS
            // Reemplaza el bloque "// ── Membresías ──" existente.
            // Pegar DESPUÉS de las plantillas de solicitud.
            // ═══════════════════════════════════════════════════════════════════════════════

            // ── Portal TPI (portal) ── 70 miembros, 11 admins (incluyendo los 3 ya existentes) ──

            // Admins existentes
            membresiaRepo.save(Membresia(usuario = admin,       portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = admin2,      portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = nuevoAdmin,  portal = portal, rol = RolMembresia.ADMIN))
// Admins nuevos (8 más = 11 total)
            membresiaRepo.save(Membresia(usuario = u001, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u002, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u003, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u004, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u005, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u006, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u007, portal = portal, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u008, portal = portal, rol = RolMembresia.ADMIN))
// Miembros regulares en TPI
            membresiaRepo.save(Membresia(usuario = noAdmin,          portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u009,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u010,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u011,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u012,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u013,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u014,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u015,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u016,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u017,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u018,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u019,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u020,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u021,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u022,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u023,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u024,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u025,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u026,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u027,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u028,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u029,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u030,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u031,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u032,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u033,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u034,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u035,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u036,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u037,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u038,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u039,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u040,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u041,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u042,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u043,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u044,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u045,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u046,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u047,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u048,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u049,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u050,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u051,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u052,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u053,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u054,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u055,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u056,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u057,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u058,  portal = portal, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u059,  portal = portal, rol = RolMembresia.MIEMBRO))

// ── Portal REDES (portalRedes) ── admin existente + nuevos ──
            membresiaRepo.save(Membresia(usuario = variasMembresias, portal = portalRedes, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u060,  portal = portalRedes, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u061,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u062,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u063,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u064,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u065,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u066,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u067,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u068,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u069,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u070,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
// Multi-membresía (también en TPI)
            membresiaRepo.save(Membresia(usuario = u015,  portal = portalRedes, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u022,  portal = portalRedes, rol = RolMembresia.MIEMBRO))

// ── Portal DATOS (portalDatos) ──
            membresiaRepo.save(Membresia(usuario = u071,  portal = portalDatos, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u072,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u073,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u074,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u075,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u076,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u077,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u078,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u079,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
// Multi-membresía
            membresiaRepo.save(Membresia(usuario = u030,  portal = portalDatos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u045,  portal = portalDatos, rol = RolMembresia.MIEMBRO))

// ── Portal ESPACIAL (portalEspacial) ──
            membresiaRepo.save(Membresia(usuario = u080,  portal = portalEspacial, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u081,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u082,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u083,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u084,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u085,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u086,  portal = portalEspacial, rol = RolMembresia.MIEMBRO))

// ── Portal ALIMENTOS (portalAlimentos) ──
            membresiaRepo.save(Membresia(usuario = u087,  portal = portalAlimentos, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u088,  portal = portalAlimentos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u089,  portal = portalAlimentos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u090,  portal = portalAlimentos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u091,  portal = portalAlimentos, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u092,  portal = portalAlimentos, rol = RolMembresia.MIEMBRO))

// ── Portal ELECTRÓNICA UTN (portalElectronica) ──
            membresiaRepo.save(Membresia(usuario = u093,  portal = portalElectronica, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u094,  portal = portalElectronica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u095,  portal = portalElectronica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u096,  portal = portalElectronica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u097,  portal = portalElectronica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u098,  portal = portalElectronica, rol = RolMembresia.MIEMBRO))

// ── Portal INFORMÁTICA UTN (portalInformaticaUTN) ──
            membresiaRepo.save(Membresia(usuario = u099,  portal = portalInformaticaUTN, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u100,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u101,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u102,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u103,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u104,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO))
// Multi-membresía
            membresiaRepo.save(Membresia(usuario = u093,  portal = portalInformaticaUTN, rol = RolMembresia.MIEMBRO)) // también en Electrónica

// ── Portal UADE (portalUADE) ──
            membresiaRepo.save(Membresia(usuario = u105,  portal = portalUADE, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u106,  portal = portalUADE, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u107,  portal = portalUADE, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u108,  portal = portalUADE, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u109,  portal = portalUADE, rol = RolMembresia.MIEMBRO))

// ── Portal BIOTECNOLOGÍA ──
            membresiaRepo.save(Membresia(usuario = u110,  portal = portalBiotecnologia, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u111,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u112,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u113,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u114,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u115,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO))
// Multi-membresía
            membresiaRepo.save(Membresia(usuario = u087,  portal = portalBiotecnologia, rol = RolMembresia.MIEMBRO)) // también en Alimentos

// ── Portal QUÍMICA (portalQuimica) ──
            membresiaRepo.save(Membresia(usuario = u116,  portal = portalQuimica, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u117,  portal = portalQuimica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u118,  portal = portalQuimica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u119,  portal = portalQuimica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u120,  portal = portalQuimica, rol = RolMembresia.MIEMBRO))

// ── Portal MEDICINA (portalMedicina) ──
            membresiaRepo.save(Membresia(usuario = u121,  portal = portalMedicina, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u122,  portal = portalMedicina, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u123,  portal = portalMedicina, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u124,  portal = portalMedicina, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u125,  portal = portalMedicina, rol = RolMembresia.MIEMBRO))

// ── Portal ARQUITECTURA (portalArquitectura) ──
            membresiaRepo.save(Membresia(usuario = u126,  portal = portalArquitectura, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u127,  portal = portalArquitectura, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u128,  portal = portalArquitectura, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u129,  portal = portalArquitectura, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u130,  portal = portalArquitectura, rol = RolMembresia.MIEMBRO))

// ── Portal ADMINISTRACIÓN (portalAdministracion) ──
            membresiaRepo.save(Membresia(usuario = u131,  portal = portalAdministracion, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u132,  portal = portalAdministracion, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u133,  portal = portalAdministracion, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u134,  portal = portalAdministracion, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u135,  portal = portalAdministracion, rol = RolMembresia.MIEMBRO))

// ── Portal PSICOLOGÍA (portalPsicologia) ──
            membresiaRepo.save(Membresia(usuario = u136,  portal = portalPsicologia, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u137,  portal = portalPsicologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u138,  portal = portalPsicologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u139,  portal = portalPsicologia, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u140,  portal = portalPsicologia, rol = RolMembresia.MIEMBRO))

// ── Portal DERECHO UBA (portalDerechoUBA) ──
            membresiaRepo.save(Membresia(usuario = u141,  portal = portalDerechoUBA, rol = RolMembresia.ADMIN))
            membresiaRepo.save(Membresia(usuario = u142,  portal = portalDerechoUBA, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u101,  portal = portalDerechoUBA, rol = RolMembresia.MIEMBRO)) // multi
            membresiaRepo.save(Membresia(usuario = u102,  portal = portalDerechoUBA, rol = RolMembresia.MIEMBRO)) // multi

// ── Portal FÍSICA (portalFisica) ──
            membresiaRepo.save(Membresia(usuario = u116,  portal = portalFisica, rol = RolMembresia.ADMIN)) // multi: también en Química
            membresiaRepo.save(Membresia(usuario = u119,  portal = portalFisica, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u120,  portal = portalFisica, rol = RolMembresia.MIEMBRO))

// ── Portal DISEÑO (portalDisenio) ──
            membresiaRepo.save(Membresia(usuario = u126,  portal = portalDisenio, rol = RolMembresia.ADMIN)) // multi: también en Arquitectura
            membresiaRepo.save(Membresia(usuario = u127,  portal = portalDisenio, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u128,  portal = portalDisenio, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u129,  portal = portalDisenio, rol = RolMembresia.MIEMBRO))

// ── Portal CONTABILIDAD (portalContabilidad) ──
            membresiaRepo.save(Membresia(usuario = u131,  portal = portalContabilidad, rol = RolMembresia.ADMIN)) // multi: también en Administración
            membresiaRepo.save(Membresia(usuario = u132,  portal = portalContabilidad, rol = RolMembresia.MIEMBRO))
            membresiaRepo.save(Membresia(usuario = u133,  portal = portalContabilidad, rol = RolMembresia.MIEMBRO))

// ── Bloqueo (existente) ──────────────────────────────────────────────────────
            bloqueoRepo.save(PortalBloqueo(
                portal = portal,
                usuario = bloqueado,
                motivo = "Comportamiento inapropiado en el foro. Bloqueado por los admins.",
            ))

            // ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 5 — SOLICITUDES
// Reemplaza/expande el bloque "// ── Solicitudes ──" existente.
// NOTA: u060-u099 y u101+ no son miembros de TPI, así que pueden tener solicitudes ahí.
// Pegar DESPUÉS de bloqueos/membresías.
// ═══════════════════════════════════════════════════════════════════════════════

// Pendiente existente (juan)
            solicitudRepo.save(Solicitud(
                usuario = solicitante,
                portal = portal,
                nombreCompleto = "Juan García",
                descripcion = "Soy alumno regular de primer año. Quiero acceder a los materiales de Algoritmos y participar del foro para hacer consultas.",
            ))

// Rechazada existente (maria)
            val solicitudRechazada = Solicitud(
                usuario = rechazado,
                portal = portal,
                nombreCompleto = "María Fernández",
                descripcion = "Quiero unirme para ver los apuntes.",
            )
            solicitudRechazada.estado = Estado.RECHAZADA
            solicitudRechazada.motivoRechazo =
                "No pudimos verificar que seas alumna regular de la carrera. Por favor reenvía la solicitud con más información sobre tu situación académica."
            solicitudRepo.save(solicitudRechazada)

// 3 solicitudes pendientes adicionales para TPI (usuarios sin membresía en TPI)
            solicitudRepo.save(Solicitud(
                usuario = u103,
                portal = portal,
                nombreCompleto = "Augusto Ríos",
                descripcion = "Estoy cursando segundo año, me anotaron tarde en la carrera y recién ahora me enteré de la existencia del portal. Tengo Algoritmos 2 y Redes Locales este cuatrimestre. Me gustaría acceder al material de parciales anteriores.",
            ))

            solicitudRepo.save(Solicitud(
                usuario = u104,
                portal = portal,
                nombreCompleto = "Florencia Leiva",
                descripcion = "Hola! Soy ingresante de este año, primer cuatrimestre. Estoy cursando Matemática I y Laboratorio de Computación I. Me dijeron que acá suben apuntes y me vendría muy bien para arrancar bien. Incluyo nombre completo como pidieron.",
            ))

            solicitudRepo.save(Solicitud(
                usuario = u105,
                portal = portal,
                nombreCompleto = "Xavier Andrade",
                descripcion = "Tercer año de la carrera, cursando Proyectos de Software y Herramientas Modernas. Tengo el parcial de PHM la próxima semana y me dijeron que en el portal hay materiales de años anteriores. Si me pueden aprobar, se los agradezco. También puedo subir cosas que tengo yo.",
            ))

            solicitudRepo.save(Solicitud(
                usuario = u120,
                portal = portal,
                nombreCompleto = "Leonardo Friz",
                descripcion = "Soy de Licenciatura en Ciencias de Datos pero también curso algunas materias de TPI como optativa. Me interesa el material de Bases de Datos y Algoritmos. Tengo conocimiento de Python y SQL.",
            ))

// Solicitud rechazada en portal Redes
            val solRechazadaRedes = Solicitud(
                usuario = u122,
                portal = portalRedes,
                nombreCompleto = "Nicolás Vásquez",
                descripcion = "Me interesa el tema de redes.",
            )
            solRechazadaRedes.estado = Estado.RECHAZADA
            solRechazadaRedes.motivoRechazo = "La solicitud no incluye información sobre tu cursada ni relación con la carrera. Por favor reenvíala con más contexto."
            solicitudRepo.save(solRechazadaRedes)

// Solicitud pendiente en Datos
            solicitudRepo.save(Solicitud(
                usuario = u125,
                portal = portalDatos,
                nombreCompleto = "Alejandra Ramos",
                descripcion = "Cuarto año de la licenciatura, cursando Aprendizaje Automático y Electiva III (Procesamiento de Lenguaje Natural). Trabajo con Python y scikit-learn en el trabajo. Quiero acceder al material de las electivas y al foro para comparar apuntes.",
            ))

// Solicitud aceptada en Datos (para historial)
            val solAceptadaDatos = Solicitud(
                usuario = u076,
                portal = portalDatos,
                nombreCompleto = "Yanina Cordero",
                descripcion = "Segundo año, cursando Probabilidad y Estadística. Me recomendó unirme un compañero del taller. Tengo experiencia con R de la secundaria técnica.",
            )
            solAceptadaDatos.estado = Estado.ACEPTADA
            solicitudRepo.save(solAceptadaDatos)

// Pendiente en Biotecnología
            solicitudRepo.save(Solicitud(
                usuario = u136,
                portal = portalBiotecnologia,
                nombreCompleto = "Patricia Jara",
                descripcion = "Tercer año de Biotecnología, con laboratorios de Microbiología Industrial y Biorreactores. Trabajo part-time en un laboratorio del CONICET. Me interesa el portal para compartir protocolos y discutir prácticas.",
            ))

// Pendiente en Electrónica UTN
            solicitudRepo.save(Solicitud(
                usuario = u117,
                portal = portalElectronica,
                nombreCompleto = "Rodrigo Muñante",
                descripcion = "Cuarto año de Ingeniería Electrónica, FRBA. Me especializo en sistemas embebidos. Quiero acceder al material de Señales y Sistemas que sé que tienen acá. Puedo aportar también guías de Arduino y ESP32.",
            ))


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