// src/main/kotlin/com/unsam/scholarium/controller/AccionAdminController.kt
package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.AccionAdminResponse
import com.unsam.scholarium.service.AccionAdminService
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/portales/{portalId}/historial")
class AccionAdminController(
    private val accionAdminService: AccionAdminService,
) {

    /**
     * GET /api/portales/{portalId}/historial?page=0&size=30
     * Solo admins del portal.
     */
    @GetMapping
    fun getHistorial(
        @PathVariable portalId: Long,
        @RequestParam(defaultValue = "0")  page: Int,
        @RequestParam(defaultValue = "30") size: Int,
    ): ResponseEntity<Page<AccionAdminResponse>> {
        val email = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: return ResponseEntity.status(401).build()

        val result = accionAdminService.getHistorial(
            portalId = portalId,
            email    = email,
            page     = page,
            size     = size,
        )
        return ResponseEntity.ok(result)
    }
}