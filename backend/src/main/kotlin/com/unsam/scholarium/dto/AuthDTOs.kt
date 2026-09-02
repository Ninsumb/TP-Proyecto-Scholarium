package com.unsam.scholarium.dto

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val refreshToken: String
)

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String
)

data class RegisterResponse(
    val id: Long?,
    val nombre: String,
    val email: String,
)

data class GoogleLoginRequest(
    val idToken: String  // El token que manda Google desde el frontend
)

data class ChangeEmailRequest(
    val newEmail: String,
    val password: String
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val token: String,
    val passwordNueva: String,
    val confirmacionPassword: String
)

data class MessageResponse(
    val message: String
)
