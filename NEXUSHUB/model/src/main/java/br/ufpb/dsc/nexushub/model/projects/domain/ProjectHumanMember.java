package br.ufpb.dsc.nexushub.model.projects.domain;

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
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prj_hummember")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProjectHumanMember extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idprjhummember")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idproject", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human human;

    @Column(name = "tpprjrole", nullable = false)
    private Integer projectRoleType = 1;

    @Column(name = "stmember", nullable = false)
    private Integer memberStatus = 1;

    @Column(name = "dtjoined", nullable = false)
    private LocalDate joinedDate = LocalDate.now();

    public ProjectHumanMember(Project project, Human human, Integer projectRoleType, UUID updatedById) {
        this.project = project;
        this.human = human;
        this.projectRoleType = projectRoleType;
        touch(updatedById);
    }
}
