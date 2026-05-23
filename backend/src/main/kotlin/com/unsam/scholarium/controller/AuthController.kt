package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.GoogleLoginRequest
import com.unsam.scholarium.dto.LoginRequest
import com.unsam.scholarium.dto.LoginResponse
import com.unsam.scholarium.dto.RegisterRequest
import com.unsam.scholarium.dto.RegisterResponse
import com.unsam.scholarium.service.AuthService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.HttpStatus
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
}