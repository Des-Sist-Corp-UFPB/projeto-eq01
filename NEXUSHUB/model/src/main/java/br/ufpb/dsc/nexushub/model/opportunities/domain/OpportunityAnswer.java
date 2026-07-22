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
@Table(name = "opp_answer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OpportunityAnswer extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idanswer")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idapply", nullable = false)
    private OpportunityApplication application;

    @ManyToOne
    @JoinColumn(name = "idquestion", nullable = false)
    private OpportunityQuestion question;

    @Column(name = "dsanswer", nullable = false)
    private String answerText;

    public OpportunityAnswer(OpportunityApplication application, OpportunityQuestion question, String answerText, UUID updatedById) {
        this.application = application;
        this.question = question;
        this.answerText = answerText;
        touch(updatedById);
    }

    public void updateAnswer(String answerText, UUID updatedById) {
        this.answerText = answerText;
        touch(updatedById);
    }
}
