package br.ufpb.dsc.nexushub.model.projects.repository;

import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectTag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, UUID> {

    List<ProjectTag> findByProject(Project project);

    List<ProjectTag> findByTag_NameIgnoreCase(String name);

    boolean existsByProjectAndTag_NameIgnoreCase(Project project, String name);
}
