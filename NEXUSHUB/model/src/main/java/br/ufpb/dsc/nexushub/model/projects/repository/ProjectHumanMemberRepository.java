package br.ufpb.dsc.nexushub.model.projects.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectHumanMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectHumanMemberRepository extends JpaRepository<ProjectHumanMember, UUID> {

    List<ProjectHumanMember> findByProject(Project project);

    Optional<ProjectHumanMember> findByProjectAndHuman(Project project, Human human);

    int countByHumanId(UUID humanId);
}
