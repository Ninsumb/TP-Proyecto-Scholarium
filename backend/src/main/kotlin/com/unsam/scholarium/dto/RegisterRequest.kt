package com.unsam.scholarium.dto

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String
)
