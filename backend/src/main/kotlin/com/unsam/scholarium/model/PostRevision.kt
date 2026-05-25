package com.unsam.scholarium.model

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "post_revisions",
    indexes = [
        Index(name = "idx_post_revisions_post_id", columnList = "post_id")
    ]
)
class PostRevision(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "post_id", nullable = false)
    val postId: UUID,

    @Column(nullable = false, length = 5000)
    val oldContent: String,

    @Column(nullable = false)
    val editedAt: Instant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edited_by_id", nullable = false)
    val editedBy: Usuario
)