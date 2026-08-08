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
@Table(name = "usr_follow")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idfollow")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idfollower", nullable = false)
    private Human follower;

    @ManyToOne
    @JoinColumn(name = "idfollowing", nullable = false)
    private Human following;

    @Column(name = "tscreated", nullable = false, updatable = false)
    private LocalDateTime createdTime = LocalDateTime.now();

    public Follow(Human follower, Human following) {
        this.follower = follower;
        this.following = following;
        this.createdTime = LocalDateTime.now();
    }
}
