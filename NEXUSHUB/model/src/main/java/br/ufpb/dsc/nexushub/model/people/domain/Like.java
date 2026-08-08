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
@Table(name = "feed_like")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idlike")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idpost", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "idhuman", nullable = false)
    private Human human;

    @Column(name = "tscreated", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Like(Post post, Human human) {
        this.post = post;
        this.human = human;
    }
}
