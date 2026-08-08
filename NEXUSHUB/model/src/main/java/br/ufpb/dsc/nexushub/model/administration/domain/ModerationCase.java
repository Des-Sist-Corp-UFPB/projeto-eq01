package br.ufpb.dsc.nexushub.model.administration.domain;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "adm_moderation_case")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ModerationCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idcase")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idreporter", nullable = false)
    private Human reporter;

    @ManyToOne
    @JoinColumn(name = "idreviewer")
    private Human reviewer;

    @Column(name = "dstargettype", nullable = false, length = 50)
    private String targetType; // 'POST' or 'USER'

    @Column(name = "idtarget", nullable = false)
    private UUID targetId;

    @Column(name = "dsstatus", nullable = false, length = 20)
    private String status = "PENDING"; // 'PENDING', 'APPROVED', 'REJECTED'

    @Column(name = "dsreason", nullable = false)
    private String reason;

    @Column(name = "tscreated", nullable = false, updatable = false)
    private LocalDateTime createdTime = LocalDateTime.now();

    @Column(name = "tsreviewed")
    private LocalDateTime reviewedTime;

    public ModerationCase(Human reporter, String targetType, UUID targetId, String reason) {
        this.reporter = reporter;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.status = "PENDING";
        this.createdTime = LocalDateTime.now();
    }

    public void review(Human reviewer, String decision) {
        this.reviewer = reviewer;
        this.status = decision; // 'APPROVED' or 'REJECTED'
        this.reviewedTime = LocalDateTime.now();
    }
}
