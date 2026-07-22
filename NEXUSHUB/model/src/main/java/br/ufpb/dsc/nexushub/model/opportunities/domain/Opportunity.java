package br.ufpb.dsc.nexushub.model.opportunities.domain;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
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
@Table(name = "opp_opp")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Opportunity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idopp")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idgroup")
    private Group group;

    @ManyToOne
    @JoinColumn(name = "idproject")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "idpublisher", nullable = false)
    private Human publisher;

    @Column(name = "nmopp", nullable = false)
    private String name;

    @Column(name = "dsopp", nullable = false)
    private String description;

    @Column(name = "tpopp", nullable = false)
    private Integer type;

    @Column(name = "tptagopp")
    private Integer tagType;

    @Column(name = "flpaid", nullable = false)
    private boolean paid;

    @Column(name = "dsremuneration")
    private String remuneration;

    @Column(name = "fluseform", nullable = false)
    private boolean useForm;

    @Column(name = "dscontactphone")
    private String contactPhone;

    @Column(name = "stopp", nullable = false)
    private Integer status = 1;

    @Column(name = "dtdeadline")
    private LocalDate deadline;

    @Column(name = "urlapply")
    private String applyUrl;

    public Opportunity(Group group, Project project, Human publisher, String name, String description, Integer type, UUID updatedById) {
        this.group = group;
        this.project = project;
        this.publisher = publisher;
        this.name = name;
        this.description = description;
        this.type = type;
        touch(updatedById);
    }

    public Opportunity(Group group, Project project, Human publisher, String name, String description, Integer type,
                       Integer tagType, boolean paid, String remuneration, boolean useForm, String contactPhone, LocalDate deadline, UUID updatedById) {
        this.group = group;
        this.project = project;
        this.publisher = publisher;
        this.name = name;
        this.description = description;
        this.type = type;
        this.tagType = tagType;
        this.paid = paid;
        this.remuneration = remuneration;
        this.useForm = useForm;
        this.contactPhone = contactPhone;
        this.deadline = deadline;
        touch(updatedById);
    }

    public void updateDetails(String name, String description, Integer type, Integer tagType, boolean paid,
                              String remuneration, boolean useForm, String contactPhone, LocalDate deadline, UUID updatedById) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.tagType = tagType;
        this.paid = paid;
        this.remuneration = remuneration;
        this.useForm = useForm;
        this.contactPhone = contactPhone;
        this.deadline = deadline;
        touch(updatedById);
    }

    public void changeStatus(Integer status, UUID updatedById) {
        this.status = status;
        touch(updatedById);
    }
}
