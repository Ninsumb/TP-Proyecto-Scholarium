package com.unsam.scholarium.service


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
    private val jwtService: JwtService
) {

    fun register(request: RegisterRequest): Usuario {
        if(usuarioRepository.existsByEmail(request.email)){
            throw IllegalArgumentException("Este correo ya se encuentra registrado")
        }

        val usuario = Usuario(
            nombre = request.nombre,
            email = request.email,
            password = passwordEncoder.encode(request.password)
        )
        return usuarioRepository.save(usuario)
    }

    fun login(request: LoginRequest): LoginResponse {
        val usuario = usuarioRepository.findByEmail(request.email)
            ?: throw UnauthorizedException("Credenciales incorrectas")

        val passwordCorrecta = passwordEncoder.matches(request.password, usuario.password)

        if(!passwordCorrecta){
            throw UnauthorizedException("Credenciales incorrectas")
        }

        val token = jwtService.generateToken(
            userId = usuario.id!!,
            email = usuario.email,
            nombre = usuario.nombre,
        )

        return LoginResponse(
            token = token,
            email = usuario.email,
            nombre = usuario.nombre,
        )
    }
}