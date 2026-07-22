package br.ufpb.dsc.nexushub.model.people.domain;

import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usr_interest")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Interest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idinterest")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "nminterest", nullable = false)
    private String name;

    @Column(name = "dsinterest")
    private String description;

    public Interest(String name, String description, UUID updatedById) {
        this.name = name;
        this.description = description;
        touch(updatedById);
    }
}
