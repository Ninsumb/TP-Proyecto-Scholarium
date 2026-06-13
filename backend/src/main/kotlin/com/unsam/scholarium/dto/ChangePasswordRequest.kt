package com.unsam.scholarium.dto

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