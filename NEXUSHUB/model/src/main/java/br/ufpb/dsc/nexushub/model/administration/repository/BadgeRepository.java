package br.ufpb.dsc.nexushub.model.administration.repository;

import br.ufpb.dsc.nexushub.model.administration.domain.Badge;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {
}
