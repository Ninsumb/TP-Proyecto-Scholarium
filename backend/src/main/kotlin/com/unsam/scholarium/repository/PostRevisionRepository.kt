// repository/PostRevisionRepository.kt
package com.unsam.scholarium.repository

import com.unsam.scholarium.model.PostRevision
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PostRevisionRepository : JpaRepository<PostRevision, UUID> {
    fun findByPostIdOrderByEditedAtDesc(postId: UUID): List<PostRevision>
}