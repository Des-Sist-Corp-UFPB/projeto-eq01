package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    Optional<Follow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    int countByFollowingId(UUID followingId);
    int countByFollowerId(UUID followerId);
    List<Follow> findAllByFollowerId(UUID followerId);
    List<Follow> findAllByFollowingId(UUID followingId);
}
