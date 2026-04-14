package com.unsam.scholarium.controller

import com.unsam.scholarium.model.Portal
import com.unsam.scholarium.service.PortalService
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/portales")
@CrossOrigin(origins = ["http://localhost:5173"])
class PortalController (
    private val portalService: PortalService
) {
    @GetMapping("/{id}")
    fun obtenerPortal(@PathVariable id: Long): Portal {
        val portal = portalService.getById(id)

        return PortalMapper.toDTO(portal)
    }

    @PostMapping
    fun crearPortal(
        @RequestBody portal: Portal,
        @RequestParam adminId: Long
    ) {
        portalService.create(portal, adminId)
    }

    @PatchMapping
    fun patchPortal(
        @RequestBody portal: Portal,
        @RequestParam adminId: Long
    ) {
        portalService.patch(portal, adminId)
    }
}