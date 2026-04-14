package com.unsam.scholarium.DTO

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String
)
