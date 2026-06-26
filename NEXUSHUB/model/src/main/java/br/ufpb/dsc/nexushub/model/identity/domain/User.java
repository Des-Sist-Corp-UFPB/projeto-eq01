package br.ufpb.dsc.nexushub.model.identity.domain;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "sec_user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User extends AuditableEntity implements Persistable<UUID> {

    @Id
    @Column(name = "iduser")
    @EqualsAndHashCode.Include
    private UUID id;

    @OneToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human human;

    @ManyToOne
    @JoinColumn(name = "idrole", nullable = false)
    private Role role;

    @Column(name = "dsemail", nullable = false)
    private String email;

    @Column(name = "dspasshash", nullable = false)
    private String passwordHash;

    @Column(name = "stemail", nullable = false)
    private Integer emailStatus = 0;

    @Column(name = "dhlastaccess")
    private LocalDateTime lastAccessAt;

    @Transient
    private boolean persisted;

    public User(UUID id, Human human, Role role, String email, String passwordHash) {
        this.id = id;
        this.human = human;
        this.role = role;
        this.email = email;
        this.passwordHash = passwordHash;
        touch(id);
    }

    public void changePassword(String passwordHash, UUID updatedById) {
        this.passwordHash = passwordHash;
        touch(updatedById);
    }

    public void changeEmail(String email, UUID updatedById) {
        this.email = email;
        touch(updatedById);
    }

    public void registerAccess() {
        this.lastAccessAt = LocalDateTime.now();
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
