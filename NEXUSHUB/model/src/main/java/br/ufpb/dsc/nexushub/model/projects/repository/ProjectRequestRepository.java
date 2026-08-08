package br.ufpb.dsc.nexushub.model.projects.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, UUID> {

    List<ProjectRequest> findByProject(Project project);

    Optional<ProjectRequest> findByProjectAndRequester(Project project, Human requester);
}
