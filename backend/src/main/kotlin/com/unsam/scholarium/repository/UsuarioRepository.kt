package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository

interface UsuarioRepository : JpaRepository<Usuario, Long> {
    fun findByEmail(email: String): Usuario?
    fun existsByEmail(email: String): Boolean
    fun findByGoogleId(googleId: String): Usuario?
}