package br.ufpb.dsc.nexushub.model.opportunities.domain;

import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "opp_form")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OpportunityForm extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idoppform")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idopp", nullable = false)
    private Opportunity opportunity;

    @Column(name = "nmform", nullable = false)
    private String name;

    public OpportunityForm(Opportunity opportunity, String name, UUID updatedById) {
        this.opportunity = opportunity;
        this.name = name;
        touch(updatedById);
    }

    public void updateName(String name, UUID updatedById) {
        this.name = name;
        touch(updatedById);
    }
}
