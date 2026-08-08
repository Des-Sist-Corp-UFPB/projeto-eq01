package br.ufpb.dsc.nexushub.model.groups.domain;

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
@Table(name = "grp_hummember")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class GroupHumanMember extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idgrphummember")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idgroup", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human human;

    @Column(name = "fladmin", nullable = false)
    private Boolean admin = false;

    @Column(name = "stmember", nullable = false)
    private Integer memberStatus = 1;

    @Column(name = "dtjoined", nullable = false)
    private LocalDate joinedDate = LocalDate.now();

    public GroupHumanMember(Group group, Human human, boolean admin, UUID updatedById) {
        this.group = group;
        this.human = human;
        this.admin = admin;
        touch(updatedById);
    }
}
