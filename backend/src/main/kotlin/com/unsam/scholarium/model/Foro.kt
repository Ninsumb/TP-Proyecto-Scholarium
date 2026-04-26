import jakarta.persistence.*
import java.util.*


Enum class TipoForo {
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
    var tipo: TipoForo

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", referencedColumnName = "id")
    var materia: Materia? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_id", nullable = false)
    var portal: Portal

    @CreationTimestamp
    @Column(nullable = false)
    createdAt: Date = Date(),

) {

}