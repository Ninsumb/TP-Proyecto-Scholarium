package com.unsam.scholarium.service

import io.jsonwebtoken.Claims
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

    private fun extractAllClaims(token:String): Claims {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload
    }

    fun extractEmail(token:String): String {
        return extractAllClaims(token).subject
    }

    fun isTokenValid(token: String): Boolean {
        val claims = extractAllClaims(token)
        val isRefresh = claims["tokenType"] == "refresh"
        if (isRefresh) return false
        return claims.expiration.after(Date())
    }

    @Value("\${jwt.refresh-expiration-ms}")
    private val refreshExpirationMs: Long = 0L

    fun generateRefreshToken(email: String): String {
        val now = Date()
        val expiration = Date(now.time + refreshExpirationMs)

        return Jwts.builder()
            .subject(email)
            .claim("tokenType", "refresh")
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getSigningKey())
            .compact()
    }

    fun isRefreshTokenValid(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            val isRefresh = claims["tokenType"] == "refresh"
            val notExpired = claims.expiration.after(Date())
            isRefresh && notExpired
        } catch (e: Exception) {
            false
        }
    }

    fun generatePasswordResetToken(email: String): String {
        return Jwts.builder()
            .subject(email)
            .claim("type", "password-reset")
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + 30 * 60 * 1000))
            .signWith(getSigningKey())
            .compact()
    }

    fun validatePasswordResetToken(token: String): String {
        val claims = extractAllClaims(token)

        if (claims["type"] != "password-reset") throw RuntimeException("Token inválido")

        return claims.subject
    }
}