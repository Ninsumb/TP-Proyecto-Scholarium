package com.unsam.scholarium.service

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) {

    private fun getSigningKey(): SecretKey {
        val keyBytes = Decoders.BASE64.decode(secret)
        return Keys.hmacShaKeyFor(keyBytes)
    }

    fun generateToken(userId: Long, email: String, nombre: String): String {
        val now = Date()
        val expiration = Date(now.time + expirationMs)

        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .claim("nombre", nombre)
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getSigningKey())
            .compact()
    }
}