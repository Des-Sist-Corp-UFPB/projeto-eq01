package br.ufpb.dsc.nexushub.model.identity.domain;

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
@Table(name = "sec_role")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Role extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idrole")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "nmrole", nullable = false)
    private String name;

    @Column(name = "dsrole")
    private String description;

    @Column(name = "tprole", nullable = false)
    private Integer type;

    public Role(String name, String description, Integer type, UUID updatedById) {
        this.name = name;
        this.description = description;
        this.type = type;
        touch(updatedById);
    }
}
