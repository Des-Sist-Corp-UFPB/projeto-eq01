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
@Table(name = "feed_post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Post extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idpost")
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "idauthor", nullable = false)
    private Human author;

    @Column(name = "dscontent", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "urlimage", length = 500)
    private String imageUrl;

    @Column(name = "tppost", length = 50, nullable = false)
    private String postType = "USER";

    @Column(name = "idgroup")
    private UUID groupId;

    public Post(Human author, String content, String imageUrl, UUID updatedById) {
        this(author, content, imageUrl, "USER", null, updatedById);
    }

    public Post(Human author, String content, String imageUrl, String postType, UUID updatedById) {
        this(author, content, imageUrl, postType, null, updatedById);
    }

    public Post(Human author, String content, String imageUrl, String postType, UUID groupId, UUID updatedById) {
        this.author = author;
        this.content = content;
        this.imageUrl = imageUrl;
        this.postType = postType != null ? postType : "USER";
        this.groupId = groupId;
        touch(updatedById);
    }
}
