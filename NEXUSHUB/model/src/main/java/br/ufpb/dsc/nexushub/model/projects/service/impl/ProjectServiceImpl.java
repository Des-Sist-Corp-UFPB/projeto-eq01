package br.ufpb.dsc.nexushub.model.projects.service.impl;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectHumanMember;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectRequest;
import br.ufpb.dsc.nexushub.model.projects.domain.ProjectTag;
import br.ufpb.dsc.nexushub.model.projects.domain.Tag;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectHumanMemberRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRequestRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectTagRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.TagRepository;
import br.ufpb.dsc.nexushub.model.projects.service.ProjectService;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTagRepository projectTagRepository;
    private final TagRepository tagRepository;
    private final ProjectRequestRepository requestRepository;
    private final ProjectHumanMemberRepository memberRepository;
    private final HumanRepository humanRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final IdentityService identityService;

    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectTagRepository projectTagRepository,
            TagRepository tagRepository,
            ProjectRequestRepository requestRepository,
            ProjectHumanMemberRepository memberRepository,
            HumanRepository humanRepository,
            GroupRepository groupRepository,
            UserRepository userRepository,
            IdentityService identityService
    ) {
        this.projectRepository = projectRepository;
        this.projectTagRepository = projectTagRepository;
        this.tagRepository = tagRepository;
        this.requestRepository = requestRepository;
        this.memberRepository = memberRepository;
        this.humanRepository = humanRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.identityService = identityService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listPublishedProjects() {
        return projectRepository.findAll().stream()
                .filter(project -> project.getRecordStatus() == 1)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listProjects(String tag, String author) {
        List<Project> projects = tag == null || tag.isBlank()
                ? listPublishedProjects()
                : projectTagRepository.findByTag_NameIgnoreCase(tag.trim()).stream()
                        .map(ProjectTag::getProject)
                        .filter(project -> project.getRecordStatus() == 1)
                        .toList();

        return projects.stream()
                .filter(project -> author == null || author.isBlank() || project.getOwner().getName().equalsIgnoreCase(author))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listProjectsByAuthor(String author) {
        return listProjects(null, author);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listHotProjects() {
        return listPublishedProjects().stream()
                .sorted(Comparator.comparing(Project::getXpAmount, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listRecentProjects() {
        return listPublishedProjects().stream()
                .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> listCollaborativeProjects() {
        return listPublishedProjects();
    }

    @Override
    @Transactional(readOnly = true)
    public Project getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Projeto nao encontrado."));
    }

    @Override
    @Transactional
    public Project createProject(UUID ownerHumanId, UUID groupId, String name, String resume, String goals, Integer type, UUID updatedById) {
        Human owner = humanRepository.findById(ownerHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Responsavel do projeto nao encontrado."));
        Group group = groupId == null ? null : groupRepository.findById(groupId).orElse(null);
        Project project = new Project(group, owner, name, resume, goals, type == null ? 1 : type, updatedById);
        project.publish(updatedById);
        Project saved = projectRepository.save(project);
        memberRepository.save(new ProjectHumanMember(saved, owner, 1, updatedById));
        return saved;
    }

    @Override
    @Transactional
    public Project createProject(ProjetoRequest request) {
        User owner = resolveOwner(request);
        Project project = createProject(
                owner.getHuman().getId(),
                request.grupoId(),
                request.nome(),
                request.resumo(),
                request.objetivos(),
                parseType(request.tipo(), 1),
                owner.getId()
        );
        project.updatePresentation(
                parseType(request.visibilidade(), 1),
                request.imagemCardUrl(),
                request.imagemLandingUrl(),
                request.xpDistribuido(),
                0,
                owner.getId()
        );
        Project saved = projectRepository.save(project);
        syncProjectTags(saved, request.tags(), owner.getId());
        return saved;
    }

    @Override
    @Transactional
    public ProjectRequest requestMembership(UUID projectId, UUID humanId, String motive, UUID updatedById) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Projeto nao encontrado."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa nao encontrada."));
        requestRepository.findByProjectAndRequester(project, human).ifPresent(request -> {
            throw new IllegalArgumentException("Voce ja enviou uma solicitacao para este projeto.");
        });
        return requestRepository.save(new ProjectRequest(project, human, motive, updatedById));
    }

    @Override
    @Transactional
    public ProjectRequest requestMembership(SolicitacaoRequest request) {
        User user = resolveRequester(request);
        return requestMembership(request.projetoId(), user.getHuman().getId(), request.motivo(), user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectRequest> listRequestsByProject(UUID projectId) {
        return requestRepository.findByProject(getProject(projectId));
    }

    @Override
    @Transactional
    public void respondMembershipRequest(UUID requestId, boolean approved) {
        User evaluator = identityService.firstUser();
        if (approved) {
            approveMembershipRequest(requestId, evaluator.getHuman().getId(), evaluator.getId());
            return;
        }
        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitacao nao encontrada."));
        request.reject(evaluator.getHuman(), evaluator.getId());
        requestRepository.save(request);
    }

    @Override
    @Transactional
    public ProjectHumanMember approveMembershipRequest(UUID requestId, UUID evaluatorHumanId, UUID updatedById) {
        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitacao nao encontrada."));
        Human evaluator = humanRepository.findById(evaluatorHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Avaliador nao encontrado."));
        request.approve(evaluator, updatedById);
        requestRepository.save(request);
        return memberRepository.findByProjectAndHuman(request.getProject(), request.getRequester())
                .orElseGet(() -> memberRepository.save(new ProjectHumanMember(request.getProject(), request.getRequester(), 2, updatedById)));
    }

    private User resolveOwner(ProjetoRequest request) {
        if (request.autorId() != null) {
            return userRepository.findById(request.autorId())
                    .or(() -> userRepository.findAll().stream()
                            .filter(user -> user.getHuman().getId().equals(request.autorId()))
                            .findFirst())
                    .orElseThrow(() -> new IllegalArgumentException("Autor nao encontrado."));
        }
        if (request.autor() != null && !request.autor().isBlank()) {
            return userRepository.findAll().stream()
                    .filter(user -> user.getHuman().getName().equalsIgnoreCase(request.autor()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Autor nao encontrado."));
        }
        throw new IllegalArgumentException("Autor do projeto e obrigatorio.");
    }

    private User resolveRequester(SolicitacaoRequest request) {
        if (request.usuarioId() != null) {
            return userRepository.findById(request.usuarioId())
                    .or(() -> userRepository.findAll().stream()
                            .filter(user -> user.getHuman().getId().equals(request.usuarioId()))
                            .findFirst())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario solicitante nao encontrado."));
        }
        if (request.usuarioEmail() != null && !request.usuarioEmail().isBlank()) {
            return userRepository.findByEmail(request.usuarioEmail().trim().toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario solicitante nao encontrado."));
        }
        throw new IllegalArgumentException("Usuario solicitante e obrigatorio.");
    }

    private Integer parseType(String value, Integer fallback) {
        try {
            return value == null || value.isBlank() ? fallback : Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private void syncProjectTags(Project project, String tags, UUID updatedById) {
        if (tags == null || tags.isBlank()) {
            return;
        }
        for (String rawTag : tags.split(",")) {
            String tagName = rawTag.trim();
            if (tagName.isBlank() || projectTagRepository.existsByProjectAndTag_NameIgnoreCase(project, tagName)) {
                continue;
            }
            Tag tag = tagRepository.findByNameIgnoreCase(tagName)
                    .orElseGet(() -> tagRepository.save(new Tag(tagName, updatedById)));
            projectTagRepository.save(new ProjectTag(project, tag, updatedById));
        }
    }
}
