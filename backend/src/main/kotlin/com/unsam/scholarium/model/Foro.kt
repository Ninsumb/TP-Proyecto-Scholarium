package com.unsam.scholarium.model


import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import com.unsam.scholarium.model.Materia
import com.unsam.scholarium.model.Portal


enum class TipoForo {
    GENERAL,
    MATERIA
}



@Entity
class Foro(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var tipo: TipoForo = TipoForo.GENERAL,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", referencedColumnName = "id")
    var materia: Materia? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    var portal: Portal? = null,

    @CreationTimestamp
    @Column(nullable = false)
    val createdAt: LocalDateTime? = null

) {

}