package br.ufpb.dsc.nexushub.model.projects.domain;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prj_project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Project extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idproject")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "idgroup", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "idowner", nullable = false)
    private Human owner;

    @Column(name = "nmproject", nullable = false)
    private String name;

    @Column(name = "dsresume", nullable = false)
    private String resume;

    @Column(name = "dsgoals")
    private String goals;

    @Column(name = "tpproject", nullable = false)
    private Integer type;

    @Column(name = "stproject", nullable = false)
    private Integer status = 1;

    @Column(name = "stvisibility", nullable = false)
    private Integer visibilityStatus = 1;

    @Column(name = "urlcover")
    private String coverUrl;

    @Column(name = "urlland")
    private String landingUrl;

    @Column(name = "qtxp", nullable = false)
    private Integer xpAmount = 0;

    @Column(name = "nrpoints", nullable = false)
    private Integer points = 0;

    public Project(Group group, Human owner, String name, String resume, String goals, Integer type, UUID updatedById) {
        if (group == null) {
            throw new IllegalArgumentException("O projeto deve estar associado a um grupo.");
        }
        this.group = group;
        this.owner = owner;
        this.name = name;
        this.resume = resume;
        this.goals = goals;
        this.type = type;
        touch(updatedById);
    }

    public void updatePresentation(
            Integer visibilityStatus,
            String coverUrl,
            String landingUrl,
            Integer xpAmount,
            Integer points,
            UUID updatedById
    ) {
        this.visibilityStatus = visibilityStatus;
        this.coverUrl = coverUrl;
        this.landingUrl = landingUrl;
        this.xpAmount = xpAmount == null ? 0 : xpAmount;
        this.points = points == null ? 0 : points;
        touch(updatedById);
    }

    public void publish(UUID updatedById) {
        this.status = 2;
        touch(updatedById);
    }
}
