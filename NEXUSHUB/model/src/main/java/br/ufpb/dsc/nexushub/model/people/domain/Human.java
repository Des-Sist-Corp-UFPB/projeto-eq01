package br.ufpb.dsc.nexushub.model.people.domain;

import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "usr_human")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Human extends AuditableEntity implements Persistable<UUID> {

    @Id
    @Column(name = "idhuman")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "nmhuman", nullable = false)
    private String name;

    @Column(name = "dsemail")
    private String email;

    @Column(name = "dsbio")
    private String bio;

    @Column(name = "dscourse")
    private String course;

    @Column(name = "nrperiod")
    private Integer period;

    @Column(name = "dtbirth")
    private LocalDate birthDate;

    @Column(name = "tpgender")
    private Integer genderType;

    @Column(name = "urlphoto")
    private String photoUrl;

    @Transient
    private boolean persisted;

    public Human(UUID id, String name, String email, UUID updatedById) {
        this.id = id;
        this.name = name;
        this.email = email;
        touch(updatedById);
    }

    public void updateProfile(String name, String email, String bio, String course, Integer period, UUID updatedById) {
        this.name = name;
        this.email = email;
        this.bio = bio;
        this.course = course;
        this.period = period;
        touch(updatedById);
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    @Override
    public boolean isNew() {
        return !persisted;
    }

    @PostLoad
    @PostPersist
    private void markPersisted() {
        this.persisted = true;
    }
}
