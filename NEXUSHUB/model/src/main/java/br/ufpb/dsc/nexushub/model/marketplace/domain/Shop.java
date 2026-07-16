package br.ufpb.dsc.nexushub.model.marketplace.domain;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "mkt_shop")
@Data
@EqualsAndHashCode(callSuper = true)
public class Shop extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "idshop")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idowner", nullable = false)
    private Human owner;

    @Column(name = "dsname", nullable = false, length = 100)
    private String name;

    @Column(name = "dsdescription", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dslogo", columnDefinition = "TEXT")
    private String logo;

    @Column(name = "dscampus", nullable = false, length = 50)
    private String campus;

    @Column(name = "flactive", nullable = false)
    private boolean active = true;

    @Column(name = "dsbanner", columnDefinition = "TEXT")
    private String banner;

    @Column(name = "dsmeetlocations", columnDefinition = "TEXT")
    private String meetLocations;

    public void update(String name, String description, String logo, String banner, String meetLocations, String campus, boolean active, UUID updatedById) {
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.banner = banner;
        this.meetLocations = meetLocations;
        this.campus = campus;
        this.active = active;
        touch(updatedById);
    }
}
