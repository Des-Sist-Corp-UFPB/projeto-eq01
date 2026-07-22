package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Like;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, UUID> {
    Optional<Like> findByPostIdAndHumanId(UUID postId, UUID humanId);
    int countByPostId(UUID postId);
    boolean existsByPostIdAndHumanId(UUID postId, UUID humanId);
}
