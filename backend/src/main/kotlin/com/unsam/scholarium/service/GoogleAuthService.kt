package com.unsam.scholarium.service

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Collections

@Service
class GoogleAuthService(
    @Value("\${google.client-id}") private val googleClientId: String
) {

    private val verifier = GoogleIdTokenVerifier.Builder(NetHttpTransport(), GsonFactory())
        .setAudience(Collections.singletonList(googleClientId))
        .build()

    /**
     * Verifica el token de Google y devuelve la info del usuario
     */
    fun verifyToken(idToken: String): GoogleUserInfo? {
        return try {
            val googleIdToken: GoogleIdToken = verifier.verify(idToken)
                ?: return null

            val payload = googleIdToken.payload
            GoogleUserInfo(
                googleId = payload.subject,
                email = payload.email,
                nombre = payload["name"] as? String ?: "",
                emailVerificado = payload.emailVerified
            )
        } catch (e: Exception) {
            null
        }
    }
}

data class GoogleUserInfo(
    val googleId: String,
    val email: String,
    val nombre: String,
    val emailVerificado: Boolean
)