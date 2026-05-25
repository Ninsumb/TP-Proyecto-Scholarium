package com.unsam.scholarium.dto

data class GoogleLoginRequest(
    val idToken: String  // El token que manda Google desde el frontend
)