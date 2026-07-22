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
@Table(name = "opp_question")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OpportunityQuestion extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idquestion")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idoppform", nullable = false)
    private OpportunityForm form;

    @Column(name = "dslabel", nullable = false)
    private String label;

    @Column(name = "tpquestion", nullable = false)
    private Integer type; // 1 = SHORT_ANSWER, 2 = MULTIPLE_CHOICE, 3 = SINGLE_CHOICE

    @Column(name = "flrequired", nullable = false)
    private boolean required;

    @Column(name = "nrsortorder", nullable = false)
    private Integer sortOrder = 0;

    public OpportunityQuestion(OpportunityForm form, String label, Integer type, boolean required, Integer sortOrder, UUID updatedById) {
        this.form = form;
        this.label = label;
        this.type = type;
        this.required = required;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        touch(updatedById);
    }

    public void updateDetails(String label, Integer type, boolean required, Integer sortOrder, UUID updatedById) {
        this.label = label;
        this.type = type;
        this.required = required;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        touch(updatedById);
    }
}
