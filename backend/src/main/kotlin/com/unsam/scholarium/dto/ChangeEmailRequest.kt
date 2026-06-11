package com.unsam.scholarium.dto

data class ChangeEmailRequest(
    val newEmail: String,
    val password: String
)