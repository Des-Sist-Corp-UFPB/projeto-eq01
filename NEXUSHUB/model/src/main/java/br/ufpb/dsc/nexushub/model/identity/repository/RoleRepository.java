package br.ufpb.dsc.nexushub.model.identity.repository;

import br.ufpb.dsc.nexushub.model.identity.domain.Role;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);
}
