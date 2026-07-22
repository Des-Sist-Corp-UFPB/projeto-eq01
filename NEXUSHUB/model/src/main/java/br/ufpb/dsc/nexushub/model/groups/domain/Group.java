package br.ufpb.dsc.nexushub.model.groups.domain;

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
@Table(name = "grp_group")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Group extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idgroup")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "nmgroup", nullable = false)
    private String name;

    @Column(name = "dsgroup", nullable = false)
    private String description;

    @Column(name = "tpgroup", nullable = false)
    private Integer type;

    @Column(name = "stgroup", nullable = false)
    private Integer status = 1;

    @Column(name = "cdcolor")
    private String colorCode;

    @Column(name = "urllogo")
    private String logoUrl;

    public Group(String name, String description, Integer type, String colorCode, String logoUrl, UUID updatedById) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.colorCode = colorCode;
        this.logoUrl = logoUrl;
        touch(updatedById);
    }

    public Group(String name, String description, Integer type, Integer status, String colorCode, String logoUrl, UUID updatedById) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.status = status;
        this.colorCode = colorCode;
        this.logoUrl = logoUrl;
        touch(updatedById);
    }
}
