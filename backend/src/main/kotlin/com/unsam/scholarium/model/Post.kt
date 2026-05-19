package com.unsam.scholarium.model

import com.unsam.scholarium.exception.BusinessException
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity
@Table(
    name = "posts",
    indexes = [
        Index(name = "idx_posts_foro_id", columnList = "foro_id"),
        Index(name = "idx_posts_post_padre_id", columnList = "post_padre_id")
    ]
)
class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = true, length = 200)
    var titulo: String? = null,

    @Column(nullable = false, length = 5000)
    var contenido: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "foro_id", nullable = false)
    var foro: Foro,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    var autor: Usuario,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_padre_id", nullable = true)
    var postPadre: Post? = null,

    @OneToMany(mappedBy = "postPadre", fetch = FetchType.LAZY)
    val respuestas: MutableList<Post> = mutableListOf(),

    @Column(nullable = false)
    var eliminado: Boolean = false,

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    val createdAt: Date? = null,

    @UpdateTimestamp
    val updatedAt: Date? = null
) {
    init {
        validar()
    }

    private fun validar() {
        if (contenido.isBlank()) throw BusinessException("El contenido del post es obligatorio")
        if (contenido.length > 5000) throw BusinessException("El contenido no puede tener más de 5000 caracteres")
        titulo?.let {
            if (it.isBlank()) throw BusinessException("El título no puede estar vacío si se especifica")
            if (it.length > 200) throw BusinessException("El título no puede tener más de 200 caracteres")
        }
    }
}