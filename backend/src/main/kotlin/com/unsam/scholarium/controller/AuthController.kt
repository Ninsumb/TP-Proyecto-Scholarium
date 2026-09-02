package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.ChangePasswordRequest
import com.unsam.scholarium.dto.ForgotPasswordRequest
import com.unsam.scholarium.dto.GoogleLoginRequest
import com.unsam.scholarium.dto.LoginRequest
import com.unsam.scholarium.dto.LoginResponse
import com.unsam.scholarium.dto.MessageResponse
import com.unsam.scholarium.dto.RegisterRequest
import com.unsam.scholarium.dto.RegisterResponse
import com.unsam.scholarium.dto.ResetPasswordRequest
import com.unsam.scholarium.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.ResponseStatus

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(@RequestBody request: RegisterRequest) : RegisterResponse {
        val usuario = authService.register(request)

        return RegisterResponse(
            id = usuario.id,
            nombre = usuario.nombre,
            email = usuario.email
        )
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest) : LoginResponse {
        return authService.login(request)
    }

    @PostMapping("/google")
    fun loginWithGoogle(@RequestBody request: GoogleLoginRequest): LoginResponse {
        return authService.loginWithGoogle(request)
    }

    data class RefreshRequest(val refreshToken: String)

    @PostMapping("/refresh")
    fun refresh(@RequestBody request: RefreshRequest): LoginResponse {
        return authService.refresh(request.refreshToken)
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(
        @RequestBody request: ForgotPasswordRequest
    ): ResponseEntity<MessageResponse> {

        authService.forgotPassword(request.email)

        return ResponseEntity.ok().build()
    }

    @PostMapping("/reset-password")
    fun resetPassword(
        @RequestBody request: ResetPasswordRequest
    ): ResponseEntity<Void> {

        authService.resetPassword(
            request.token,
            request.passwordNueva,
            request.confirmacionPassword
        )

        return ResponseEntity.noContent().build()
    }

    // TODO: Borrar este endpoint, ya que la funcionalidad de cambiar contraseña es parte del usuario
    @PostMapping("/change-password")
    fun changePassword(
        @RequestBody request: ChangePasswordRequest,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val email = authentication.name
        authService.changePassword(email, request)
        return ResponseEntity.noContent().build()
    }
}