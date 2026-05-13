package com.unsam.scholarium.model

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "portal_home_page")
data class PortalHomePage(
    @Id
    @GeneratedValue
    val id: UUID = UUID.randomUUID(),

    @Column(name = "portal_id", unique = true, nullable = false)
    val portalId: Long? = null,

    @Type(JsonBinaryType::class)
    @Column(name = "blocks", columnDefinition = "jsonb", nullable = false)
    val blocks: List<Block>,

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_by")
    val updatedBy: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", insertable = false, updatable = false)
    val portal: Portal? = null
)

data class Block(
    val type: String,
    val id: String,
    val data: Map<String, Any>
)