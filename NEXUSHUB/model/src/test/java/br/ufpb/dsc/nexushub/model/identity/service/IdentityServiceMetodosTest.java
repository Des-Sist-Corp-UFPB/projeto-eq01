package br.ufpb.dsc.nexushub.model.identity.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.identity.domain.*;
import br.ufpb.dsc.nexushub.model.identity.repository.*;
import br.ufpb.dsc.nexushub.model.identity.service.impl.IdentityServiceImpl;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

@DisplayName("Testes dos Métodos de Identidade e Autenticação (IdentityService)")
public class IdentityServiceMetodosTest {

    private UserRepository userRepository = mock(UserRepository.class);
    private RoleRepository roleRepository = mock(RoleRepository.class);
    private HumanRepository humanRepository = mock(HumanRepository.class);
    private PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private TechnologyRepository technologyRepository = mock(TechnologyRepository.class);

    private IdentityServiceImpl identityService;

    @BeforeEach
    void setup() {
        identityService = new IdentityServiceImpl(
                userRepository, roleRepository, humanRepository, passwordEncoder, technologyRepository
        );
        when(humanRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
    }

    @Test
    @DisplayName("Metodo registerUser: Deve registrar novo usuario e retornar objeto User com email normalizado e role correta")
    void testRegisterUser_Sucesso() {
        Role role = mock(Role.class);
        when(role.getName()).thenReturn("USER");
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role));

        User user = identityService.registerUser("  Silva  ", " SILVA@UFPB.BR ", "senha123", null, null);

        assertNotNull(user, "O retorno do metodo registerUser nao deve ser nulo");
        assertEquals("silva@ufpb.br", user.getEmail(), "O metodo deve retornar o email normalizado em minusculas");
        assertEquals(role, user.getRole(), "O metodo deve associar a role padrao USER");
        assertNotNull(user.getHuman(), "O objeto Human vinculado nao deve ser nulo");
        assertEquals("Silva", user.getHuman().getName(), "O nome da pessoa deve ter os espacos removidos");
    }

    @Test
    @DisplayName("Metodo registerUser: Deve lancar IllegalArgumentException ao tentar cadastrar email duplicado")
    void testRegisterUser_EmailDuplicado() {
        when(userRepository.findByEmail("duplicado@ufpb.br")).thenReturn(Optional.of(mock(User.class)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            identityService.registerUser("Silva", "duplicado@ufpb.br", "senha123", null, null);
        });

        assertTrue(ex.getMessage().contains("cadastrado"), "Retorno de erro deve indicar que o email ja esta cadastrado");
    }

    @Test
    @DisplayName("Metodo authenticate: Deve retornar Optional<User> com dados validos quando credenciais estiverem corretas")
    void testAuthenticate_Sucesso() {
        User userMock = mock(User.class);
        when(userMock.getPasswordHash()).thenReturn("hashed_password");
        when(userRepository.findByEmail("silva@ufpb.br")).thenReturn(Optional.of(userMock));
        when(passwordEncoder.matches("senha123", "hashed_password")).thenReturn(true);

        Optional<User> result = identityService.authenticate(" SILVA@UFPB.BR ", "senha123");

        assertTrue(result.isPresent(), "O metodo deve retornar um Optional presente para credenciais validas");
        assertEquals(userMock, result.get(), "O usuario retornado deve ser o mesmo encontrado no repositorio");
        verify(userMock, times(1)).registerAccess();
    }

    @Test
    @DisplayName("Metodo authenticate: Deve retornar Optional.empty() quando a senha for incorreta")
    void testAuthenticate_SenhaIncorreta() {
        User userMock = mock(User.class);
        when(userMock.getPasswordHash()).thenReturn("hashed_password");
        when(userRepository.findByEmail("silva@ufpb.br")).thenReturn(Optional.of(userMock));
        when(passwordEncoder.matches("senha_errada", "hashed_password")).thenReturn(false);

        Optional<User> result = identityService.authenticate("silva@ufpb.br", "senha_errada");

        assertTrue(result.isEmpty(), "O metodo deve retornar Optional vazio para senha incorreta");
    }

    @Test
    @DisplayName("Metodo completeOnboarding: Deve atualizar dados do onboarding e marcar flag de conclusao")
    void testCompleteOnboarding_Sucesso() {
        UUID userId = UUID.randomUUID();
        User userMock = mock(User.class);
        Human humanMock = mock(Human.class);

        when(userRepository.findById(userId)).thenReturn(Optional.of(userMock));
        when(userMock.getHuman()).thenReturn(humanMock);

        User result = identityService.completeOnboarding(
                userId, "Silva Dev", java.time.LocalDate.of(2000, 5, 10), true, "Ciência da Computação", "5", "silva_dev"
        );

        assertNotNull(result, "Retorno do metodo completeOnboarding nao deve ser nulo");
        verify(userMock).completeOnboarding(userId);
        verify(humanMock).setUsername("silva_dev");
        verify(humanRepository).save(humanMock);
    }
}
