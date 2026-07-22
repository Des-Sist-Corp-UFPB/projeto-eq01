package br.ufpb.dsc.nexushub.model.projects.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.repository.*;
import br.ufpb.dsc.nexushub.model.projects.service.impl.ProjectServiceImpl;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos de Gestão de Projetos (ProjectService)")
public class ProjectServiceMetodosTest {

    private ProjectRepository projectRepository = mock(ProjectRepository.class);
    private ProjectTagRepository projectTagRepository = mock(ProjectTagRepository.class);
    private TagRepository tagRepository = mock(TagRepository.class);
    private ProjectRequestRepository requestRepository = mock(ProjectRequestRepository.class);
    private ProjectHumanMemberRepository memberRepository = mock(ProjectHumanMemberRepository.class);
    private HumanRepository humanRepository = mock(HumanRepository.class);
    private GroupRepository groupRepository = mock(GroupRepository.class);
    private UserRepository userRepository = mock(UserRepository.class);
    private IdentityService identityService = mock(IdentityService.class);

    private ProjectServiceImpl projectService;

    @BeforeEach
    void setup() {
        projectService = new ProjectServiceImpl(
                projectRepository, projectTagRepository, tagRepository, requestRepository,
                memberRepository, humanRepository, groupRepository, userRepository, identityService
        );
    }

    @Test
    @DisplayName("Metodo createProject: Deve criar um novo projeto com sucesso e vincular o criador como membro LIDER")
    void testCreateProject_Sucesso() {
        UUID groupId = UUID.randomUUID();
        UUID ownerHumanId = UUID.randomUUID();

        Group group = mock(Group.class);
        Human owner = mock(Human.class);

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(humanRepository.findById(ownerHumanId)).thenReturn(Optional.of(owner));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Project created = projectService.createProject(ownerHumanId, groupId, "Projeto NexusHub AI", "Resumo", "Objetivos", 1, ownerHumanId);

        assertNotNull(created, "O projeto criado nao deve ser nulo");
        assertEquals("Projeto NexusHub AI", created.getName(), "O nome do projeto retornado deve coincidir");
        assertEquals(group, created.getGroup(), "O grupo associado deve ser retornado corretamente");
        verify(projectRepository).save(any(Project.class));
        verify(memberRepository).save(any());
    }

    @Test
    @DisplayName("Metodo createProject: Deve lancar IllegalArgumentException caso o grupo obrigatorio seja nulo")
    void testCreateProject_GrupoInexistente() {
        UUID ownerId = UUID.randomUUID();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            projectService.createProject(ownerId, null, "Projeto Invalido", "Resumo", "Objetivos", 1, ownerId);
        });

        assertNotNull(ex.getMessage(), "A mensagem da excecao nao deve ser nula");
    }

    @Test
    @DisplayName("Metodo getProject: Deve retornar o projeto correspondente ao ID informado")
    void testGetProject_Sucesso() {
        UUID projectId = UUID.randomUUID();
        Project projectMock = mock(Project.class);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(projectMock));

        Project result = projectService.getProject(projectId);

        assertNotNull(result, "O projeto encontrado nao deve ser nulo");
        assertEquals(projectMock, result, "O objeto de projeto retornado deve ser o do repositorio");
    }
}
