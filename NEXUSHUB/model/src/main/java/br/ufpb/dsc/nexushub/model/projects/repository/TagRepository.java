package br.ufpb.dsc.nexushub.model.projects.repository;

import br.ufpb.dsc.nexushub.model.projects.domain.Tag;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByName(String name);

    Optional<Tag> findByNameIgnoreCase(String name);
}
