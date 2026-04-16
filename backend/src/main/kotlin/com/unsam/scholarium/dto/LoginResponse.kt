package com.unsam.scholarium.dto

data class LoginResponse(
    val token: String,
    val nombre: String,
    val email: String
)
