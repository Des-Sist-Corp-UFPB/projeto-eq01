package br.ufpb.dsc.nexushub.model.projects.service;

import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectHumanMember;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectRequest;
import java.util.List;
import java.util.UUID;

public interface ProjectService {

    List<Project> listPublishedProjects();

    List<Project> listProjects(String tag, String author);

    List<Project> listProjectsByAuthor(String author);

    List<Project> listHotProjects();

    List<Project> listRecentProjects();

    List<Project> listCollaborativeProjects();

    Project getProject(UUID projectId);

    Project createProject(UUID ownerHumanId, UUID groupId, String name, String resume, String goals, Integer type, UUID updatedById);

    Project createProject(br.ufpb.dsc.nexushub.model.dto.ProjetoRequest request);

    ProjectRequest requestMembership(UUID projectId, UUID humanId, String motive, UUID updatedById);

    ProjectRequest requestMembership(br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest request);

    List<ProjectRequest> listRequestsByProject(UUID projectId);

    void respondMembershipRequest(UUID requestId, boolean approved);

    ProjectHumanMember approveMembershipRequest(UUID requestId, UUID evaluatorHumanId, UUID updatedById);
}
