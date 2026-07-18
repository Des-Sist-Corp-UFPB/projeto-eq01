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
@Table(name = "opp_option")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OpportunityOption extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idoption")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idquestion", nullable = false)
    private OpportunityQuestion question;

    @Column(name = "nmoption", nullable = false)
    private String optionName;

    @Column(name = "nrsortorder", nullable = false)
    private Integer sortOrder = 0;

    public OpportunityOption(OpportunityQuestion question, String optionName, Integer sortOrder, UUID updatedById) {
        this.question = question;
        this.optionName = optionName;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        touch(updatedById);
    }

    public void updateDetails(String optionName, Integer sortOrder, UUID updatedById) {
        this.optionName = optionName;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        touch(updatedById);
    }
}
