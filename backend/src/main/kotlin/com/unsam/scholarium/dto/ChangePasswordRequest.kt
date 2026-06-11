package com.unsam.scholarium.dto

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)