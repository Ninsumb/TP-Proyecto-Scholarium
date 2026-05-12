package com.unsam.scholarium.controller

import com.unsam.scholarium.dto.BlocksResponse
import com.unsam.scholarium.dto.UpdateBlocksRequest
import com.unsam.scholarium.service.PortalHomePageService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/portales/{portalId}/home")
@CrossOrigin(origins = ["http://localhost:5173"])
class PortalHomePageController(
    private val portalHomePageService: PortalHomePageService
) {

    @GetMapping
    fun obtenerBlocks(
        @PathVariable portalId: Long
    ): BlocksResponse {
        val blocks = portalHomePageService.getBlocks(portalId)
        return BlocksResponse(blocks)
    }

    @PutMapping
    fun actualizarBlocks(
        @PathVariable portalId: Long,
        @RequestBody request: UpdateBlocksRequest,
        authentication: Authentication
    ): ResponseEntity<BlocksResponse> {
        val email = authentication.name

        val updatedPage = portalHomePageService.updateBlocks(portalId, email, request)

        return ResponseEntity.ok(BlocksResponse(updatedPage.blocks))
    }
}