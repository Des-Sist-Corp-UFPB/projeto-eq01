package br.ufpb.dsc.nexushub.model.groups.repository;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, UUID> {
}
