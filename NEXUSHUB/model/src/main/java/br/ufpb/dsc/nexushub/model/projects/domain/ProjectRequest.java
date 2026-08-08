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
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prj_request")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProjectRequest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idrequest")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idproject", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human requester;

    @ManyToOne
    @JoinColumn(name = "idevaluator")
    private Human evaluator;

    @Column(name = "dsmotive", nullable = false)
    private String motive;

    @Column(name = "dsanswer")
    private String answer;

    @Column(name = "strequest", nullable = false)
    private Integer requestStatus = 1;

    @Column(name = "tsevaluated")
    private LocalDateTime evaluatedAt;

    public ProjectRequest(Project project, Human requester, String motive, UUID updatedById) {
        this.project = project;
        this.requester = requester;
        this.motive = motive;
        touch(updatedById);
    }

    public void approve(Human evaluator, UUID updatedById) {
        this.evaluator = evaluator;
        this.requestStatus = 2;
        this.evaluatedAt = LocalDateTime.now();
        touch(updatedById);
    }

    public void reject(Human evaluator, UUID updatedById) {
        this.evaluator = evaluator;
        this.requestStatus = 3;
        this.evaluatedAt = LocalDateTime.now();
        touch(updatedById);
    }
}
