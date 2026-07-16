package br.ufpb.dsc.nexushub.model.people.domain;

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
@Table(name = "usr_testimonial")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Testimonial extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idtestimonial")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idreceiver", nullable = false)
    private Human receiver;

    @ManyToOne
    @JoinColumn(name = "idsender", nullable = false)
    private Human sender;

    @Column(name = "dscontent", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "flaccepted", nullable = false)
    private boolean accepted;

    public Testimonial(Human receiver, Human sender, String content, UUID updatedById) {
        this.receiver = receiver;
        this.sender = sender;
        this.content = content;
        this.accepted = false;
        touch(updatedById);
    }

    public void accept(UUID updatedById) {
        this.accepted = true;
        touch(updatedById);
    }
}
