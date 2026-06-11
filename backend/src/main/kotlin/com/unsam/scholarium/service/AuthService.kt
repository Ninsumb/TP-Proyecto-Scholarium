package com.unsam.scholarium.service

import com.unsam.scholarium.dto.ChangeEmailRequest
import com.unsam.scholarium.dto.ChangePasswordRequest
import com.unsam.scholarium.dto.GoogleLoginRequest
import com.unsam.scholarium.dto.LoginRequest
import com.unsam.scholarium.dto.LoginResponse
import com.unsam.scholarium.dto.RegisterRequest
import com.unsam.scholarium.exception.UnauthorizedException
import com.unsam.scholarium.model.Usuario
import com.unsam.scholarium.repository.UsuarioRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val usuarioRepository: UsuarioRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val googleAuthService: GoogleAuthService
) {

    fun register(request: RegisterRequest): Usuario {
        if(usuarioRepository.existsByEmail(request.email)){
            throw IllegalArgumentException("Este correo ya se encuentra registrado")
        }

        val usuario = Usuario(
            nombre = request.nombre,
            email = request.email,
            password = passwordEncoder.encode(request.password),
            googleId = null  // Usuario de email/password NO tiene googleId
        )
        return usuarioRepository.save(usuario)
    }

    fun login(request: LoginRequest): LoginResponse {
        val usuario = usuarioRepository.findByEmail(request.email)
            ?: throw UnauthorizedException("Credenciales incorrectas")

        // Verificar que sea un usuario de email/password (NO de Google)
        if (usuario.password == null) {
            throw UnauthorizedException("Esta cuenta fue creada con Google. Usa 'Continuar con Google'")
        }

        val passwordCorrecta = passwordEncoder.matches(request.password, usuario.password)
        if (!passwordCorrecta) {
            throw UnauthorizedException("Credenciales incorrectas")
        }

        val token = jwtService.generateToken(
            userId = usuario.id!!,
            email = usuario.email,
            nombre = usuario.nombre,
        )

        val refreshToken = jwtService.generateRefreshToken(email = usuario.email)

        return LoginResponse(token = token, refreshToken = refreshToken)
    }

    /**
     * LOGIN/REGISTRO CON GOOGLE
     *
     * Este método maneja AMBOS casos:
     * 1. Si el usuario NO existe -> Lo crea (REGISTRO automático)
     * 2. Si el usuario YA existe con Google -> Lo loguea
     * 3. Si el usuario existe con EMAIL/PASSWORD -> ERROR (seguridad)
     */
    fun loginWithGoogle(request: GoogleLoginRequest): LoginResponse {
        // PASO 1: Verificar el token con Google
        val googleUser = googleAuthService.verifyToken(request.idToken)
            ?: throw UnauthorizedException("Token de Google inválido")

        if (!googleUser.emailVerificado) {
            throw UnauthorizedException("El email de Google no está verificado")
        }

        // PASO 2: Buscar usuario en la BD
        var usuario = usuarioRepository.findByGoogleId(googleUser.googleId)

        // PASO 3: Si NO existe por googleId, buscar por email
        if (usuario == null) {
            val usuarioExistentePorEmail = usuarioRepository.findByEmail(googleUser.email)

            if (usuarioExistentePorEmail != null) {
                // El usuario YA EXISTE con email/password
                // ⚠️ DECISIÓN DE SEGURIDAD: NO permitir vincular automáticamente
                throw IllegalArgumentException(
                    "Ya existe una cuenta con este email. Por favor, inicia sesión con tu contraseña."
                )
            }

            // Usuario NUEVO -> Crear cuenta automáticamente (REGISTRO)
            usuario = Usuario(
                nombre = googleUser.nombre,
                email = googleUser.email,
                googleId = googleUser.googleId,
                password = null  // Los usuarios de Google NO tienen contraseña
            )
            usuario = usuarioRepository.save(usuario)
        }

        // PASO 4: Generar tokens JWT (MISMO proceso para login y registro)
        val token = jwtService.generateToken(
            userId = usuario.id!!,
            email = usuario.email,
            nombre = usuario.nombre,
        )

        val refreshToken = jwtService.generateRefreshToken(email = usuario.email)

        return LoginResponse(token = token, refreshToken = refreshToken)
    }

    fun refresh(refreshToken: String): LoginResponse {
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw UnauthorizedException("Refresh token inválido o expirado")
        }

        val email = jwtService.extractEmail(refreshToken)
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw UnauthorizedException("Usuario no encontrado")

        val newToken = jwtService.generateToken(
            userId = usuario.id!!,
            email = usuario.email,
            nombre = usuario.nombre,
        )
        val newRefreshToken = jwtService.generateRefreshToken(email = usuario.email)

        return LoginResponse(token = newToken, refreshToken = newRefreshToken)
    }

    fun changePassword(email: String, request: ChangePasswordRequest) {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw UnauthorizedException("Usuario no encontrado")

        // Verificar que sea un usuario de email/password (NO de Google)
        if (usuario.password == null) {
            throw UnauthorizedException("Esta cuenta fue creada con Google. No se puede cambiar contraseña.")
        }

        // Verificar contraseña actual
        val passwordCorrecta = passwordEncoder.matches(request.currentPassword, usuario.password)
        if (!passwordCorrecta) {
            throw UnauthorizedException("Contraseña actual incorrecta")
        }

        // Validar nueva contraseña
        if (request.newPassword.length < 8) {
            throw IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres")
        }

        // Actualizar contraseña
        usuario.password = passwordEncoder.encode(request.newPassword)
        usuarioRepository.save(usuario)
    }

    //TODO: Ver qué hacemos con el email
/*    fun changeEmail(email: String, request: ChangeEmailRequest): String {
        val usuario = usuarioRepository.findByEmail(email)
            ?: throw UnauthorizedException("Usuario no encontrado")

        // Verificar que sea un usuario de email/password (NO de Google)
        if (usuario.password == null) {
            throw UnauthorizedException("Esta cuenta fue creada con Google. No se puede cambiar email.")
        }

        // Verificar contraseña
        val passwordCorrecta = passwordEncoder.matches(request.password, usuario.password)
        if (!passwordCorrecta) {
            throw UnauthorizedException("Contraseña incorrecta")
        }

        // Verificar que el nuevo email no esté en uso
        if (usuarioRepository.existsByEmail(request.newEmail)) {
            throw IllegalArgumentException("Este correo ya se encuentra registrado")
        }

        // Actualizar email
        usuario.email = request.newEmail
        usuarioRepository.save(usuario)

        return request.newEmail
    }*/
}