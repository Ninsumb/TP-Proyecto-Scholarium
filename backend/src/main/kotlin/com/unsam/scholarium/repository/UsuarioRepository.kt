package com.unsam.scholarium.repository

import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface UsuarioRepository : JpaRepository<Usuario, Long> {
    fun findByEmail(email: String): Usuario?
    fun existsByEmail(email: String): Boolean
    fun findByGoogleId(googleId: String): Usuario?
}