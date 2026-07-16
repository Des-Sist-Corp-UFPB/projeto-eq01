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

    @Column(name = "dsusername", nullable = false, unique = true)
    private String username;

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

    @Column(name = "tpuser")
    private String userType = "Aluno";

    @Column(name = "flshowbirthday", nullable = false)
    private boolean showBirthday = true;

    @Column(name = "nrmatricula")
    private String matricula;

    @Column(name = "nryingresso")
    private String ingressPeriod;

    @Column(name = "nyconclusao")
    private String conclusionPeriod;

    @Column(name = "nrwhatsapp")
    private String whatsapp;

    @Column(name = "urlgithub")
    private String githubUrl;

    @Column(name = "urlinstagram")
    private String instagramUrl;

    @Column(name = "urllinkedin")
    private String linkedinUrl;

    @Column(name = "urlwebsite")
    private String websiteUrl;

    @Column(name = "dsgenderother")
    private String genderOther;

    @Column(name = "flnotifrecommendations", nullable = false)
    private boolean notifRecommendations = true;

    @Column(name = "flnotifapplications", nullable = false)
    private boolean notifApplications = true;

    @Column(name = "flnotifannouncements", nullable = false)
    private boolean notifAnnouncements = true;

    @Column(name = "flnotifedicts", nullable = false)
    private boolean notifEdicts = true;

    @Column(name = "flnotifadmin", nullable = false)
    private boolean notifAdmin = true;

    @Column(name = "dsexperience")
    private String experience;

    @Column(name = "dseducation")
    private String education;

    @Column(name = "dscertification")
    private String certification;

    @jakarta.persistence.ManyToMany
    @jakarta.persistence.JoinTable(
        name = "usr_humtech",
        joinColumns = @jakarta.persistence.JoinColumn(name = "idhuman"),
        inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "idtechnology")
    )
    private java.util.Set<Technology> technologies = new java.util.HashSet<>();

    @Transient
    private boolean persisted;

    public Human(UUID id, String name, String email, String username, UUID updatedById) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.username = username;
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

    public void setUsername(String username) {
        this.username = username;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public void updateOnboarding(String name, LocalDate birthDate, boolean showBirthday, String course, Integer period, UUID updatedById) {
        this.name = name;
        this.birthDate = birthDate;
        this.showBirthday = showBirthday;
        this.course = course;
        this.period = period;
        touch(updatedById);
    }

    public void updateAcademicDetails(String course, String matricula, String ingressPeriod, String conclusionPeriod, UUID updatedById) {
        this.course = course;
        this.matricula = matricula;
        this.ingressPeriod = ingressPeriod;
        this.conclusionPeriod = conclusionPeriod;
        touch(updatedById);
    }

    public void updatePersonalDetails(String name, String bio, String photoUrl, LocalDate birthDate, Integer genderType, String genderOther, UUID updatedById) {
        this.name = name;
        this.bio = bio;
        this.photoUrl = photoUrl;
        this.birthDate = birthDate;
        this.genderType = genderType;
        this.genderOther = genderOther;
        touch(updatedById);
    }

    public void updateContacts(String whatsapp, String githubUrl, String instagramUrl, String linkedinUrl, String websiteUrl, UUID updatedById) {
        this.whatsapp = whatsapp;
        this.githubUrl = githubUrl;
        this.instagramUrl = instagramUrl;
        this.linkedinUrl = linkedinUrl;
        this.websiteUrl = websiteUrl;
        touch(updatedById);
    }

    public void updateNotifications(boolean recs, boolean apps, boolean anns, boolean edicts, boolean admin, UUID updatedById) {
        this.notifRecommendations = recs;
        this.notifApplications = apps;
        this.notifAnnouncements = anns;
        this.notifEdicts = edicts;
        this.notifAdmin = admin;
        touch(updatedById);
    }

    public void updateExperienceSections(String experience, String education, String certification, UUID updatedById) {
        this.experience = experience;
        this.education = education;
        this.certification = certification;
        touch(updatedById);
    }

    public void setTechnologies(java.util.Set<Technology> technologies) {
        this.technologies = technologies;
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
