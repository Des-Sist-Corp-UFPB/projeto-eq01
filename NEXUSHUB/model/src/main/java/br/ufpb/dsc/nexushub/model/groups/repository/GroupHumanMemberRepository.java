package br.ufpb.dsc.nexushub.model.groups.repository;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.domain.GroupHumanMember;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupHumanMemberRepository extends JpaRepository<GroupHumanMember, UUID> {

    List<GroupHumanMember> findByGroup(Group group);

    Optional<GroupHumanMember> findByGroupAndHuman(Group group, Human human);
}
