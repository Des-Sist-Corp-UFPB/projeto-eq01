package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HumanRepository extends JpaRepository<Human, UUID> {
    boolean existsByUsername(String username);
    java.util.Optional<Human> findByUsername(String username);
}
