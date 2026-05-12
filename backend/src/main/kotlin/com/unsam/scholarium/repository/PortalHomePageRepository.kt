package com.unsam.scholarium.repository

import com.unsam.scholarium.model.PortalHomePage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

import java.util.*

@Repository
interface PortalHomePageRepository : JpaRepository<PortalHomePage, UUID> {
    fun findByPortalId(portalId: Long): PortalHomePage?
}