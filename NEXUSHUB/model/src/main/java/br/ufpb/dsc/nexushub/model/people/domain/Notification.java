package br.ufpb.dsc.nexushub.model.people.domain;

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
@Table(name = "usr_notification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idnotification")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idreceiver", nullable = false)
    private Human receiver;

    @Column(name = "dsmessage", nullable = false)
    private String message;

    @Column(name = "flread", nullable = false)
    private boolean read = false;

    @Column(name = "tscreated", nullable = false, updatable = false)
    private LocalDateTime createdTime = LocalDateTime.now();

    public Notification(Human receiver, String message) {
        this.receiver = receiver;
        this.message = message;
        this.read = false;
        this.createdTime = LocalDateTime.now();
    }

    public void markAsRead() {
        this.read = true;
    }
}
