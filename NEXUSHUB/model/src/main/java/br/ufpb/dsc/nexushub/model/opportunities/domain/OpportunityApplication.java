package br.ufpb.dsc.nexushub.model.opportunities.domain;

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
@Table(name = "opp_apply")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OpportunityApplication extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idapply")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idopp", nullable = false)
    private Opportunity opportunity;

    @ManyToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human human;

    @Column(name = "dsmessage")
    private String message;

    @Column(name = "stapply", nullable = false)
    private Integer applicationStatus = 1;

    public OpportunityApplication(Opportunity opportunity, Human human, String message, UUID updatedById) {
        this.opportunity = opportunity;
        this.human = human;
        this.message = message;
        touch(updatedById);
    }
}
