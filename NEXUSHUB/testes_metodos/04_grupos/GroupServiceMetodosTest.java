package br.ufpb.dsc.nexushub.model.groups.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupHumanMemberRepository;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.groups.service.impl.GroupServiceImpl;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos de Gestão de Grupos (GroupService)")
public class GroupServiceMetodosTest {

    private GroupRepository groupRepository = mock(GroupRepository.class);
    private HumanRepository humanRepository = mock(HumanRepository.class);
    private GroupHumanMemberRepository memberRepository = mock(GroupHumanMemberRepository.class);
    private UserRepository userRepository = mock(UserRepository.class);
    private IdentityService identityService = mock(IdentityService.class);

    private GroupServiceImpl groupService;

    @BeforeEach
    void setup() {
        groupService = new GroupServiceImpl(
                groupRepository, humanRepository, memberRepository, userRepository, identityService
        );
    }

    @Test
    @DisplayName("Metodo createGroup: Deve criar grupo de pesquisa/laboratorio com sucesso e associar criador como lider")
    void testCreateGroup_Sucesso() {
        UUID creatorId = UUID.randomUUID();
        Human creator = mock(Human.class);
        Group groupSaved = mock(Group.class);
        when(groupSaved.getId()).thenReturn(UUID.randomUUID());
        when(groupSaved.getName()).thenReturn("Laboratório de Inteligência Artificial");

        when(humanRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(groupRepository.save(any(Group.class))).thenReturn(groupSaved);
        when(groupRepository.findById(any())).thenReturn(Optional.of(groupSaved));

        Group group = groupService.createGroup("Laboratório de Inteligência Artificial", "Pesquisas em IA e ML", 1, creatorId, creatorId);

        assertNotNull(group, "O grupo criado nao deve ser nulo");
        assertEquals("Laboratório de Inteligência Artificial", group.getName(), "O nome do grupo retornado deve coincidir");
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    @DisplayName("Metodo getGroup: Deve retornar o grupo pelo ID ou lancar IllegalArgumentException caso nao exista")
    void testGetGroup_SucessoEInexistente() {
        UUID validId = UUID.randomUUID();
        UUID invalidId = UUID.randomUUID();
        Group groupMock = mock(Group.class);

        when(groupRepository.findById(validId)).thenReturn(Optional.of(groupMock));
        when(groupRepository.findById(invalidId)).thenReturn(Optional.empty());

        assertEquals(groupMock, groupService.getGroup(validId), "O grupo retornado deve corresponder ao ID valido");
        assertThrows(IllegalArgumentException.class, () -> groupService.getGroup(invalidId), "ID invalido deve disparar excecao");
    }

    @Test
    @DisplayName("Metodo listActiveGroups: Deve filtrar e retornar apenas grupos com recordStatus igual a 1")
    void testListActiveGroups_FiltroAtivos() {
        Group active1 = mock(Group.class);
        when(active1.getRecordStatus()).thenReturn(1);
        Group inactive = mock(Group.class);
        when(inactive.getRecordStatus()).thenReturn(0);

        when(groupRepository.findAll()).thenReturn(List.of(active1, inactive));

        List<Group> activeGroups = groupService.listActiveGroups();

        assertEquals(1, activeGroups.size(), "Deve retornar apenas 1 grupo ativo");
        assertTrue(activeGroups.contains(active1), "A lista deve conter o grupo ativo");
        assertFalse(activeGroups.contains(inactive), "A lista nao deve conter o grupo inativo");
    }
}
