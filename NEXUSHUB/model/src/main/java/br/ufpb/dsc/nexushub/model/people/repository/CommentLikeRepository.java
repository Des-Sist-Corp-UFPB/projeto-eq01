package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.CommentLike;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {
    Optional<CommentLike> findByCommentIdAndHumanId(UUID commentId, UUID humanId);
    int countByCommentId(UUID commentId);
    boolean existsByCommentIdAndHumanId(UUID commentId, UUID humanId);
}
