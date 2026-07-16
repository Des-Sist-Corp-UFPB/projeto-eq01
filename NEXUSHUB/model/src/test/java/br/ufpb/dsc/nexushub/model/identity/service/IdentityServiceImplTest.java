package br.ufpb.dsc.nexushub.model.identity.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.identity.domain.*;
import br.ufpb.dsc.nexushub.model.identity.repository.*;
import br.ufpb.dsc.nexushub.model.identity.service.impl.IdentityServiceImpl;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.security.crypto.password.PasswordEncoder;

class IdentityServiceImplTest {

    UserRepository users = mock(UserRepository.class);
    RoleRepository roles = mock(RoleRepository.class);
    HumanRepository humans = mock(HumanRepository.class);
    PasswordEncoder encoder = mock(PasswordEncoder.class);
    br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository technologies = 
            mock(br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository.class);
    IdentityServiceImpl service = new IdentityServiceImpl(users, roles, humans, encoder, technologies);

    @BeforeEach
    void saves() {
        when(humans.save(any())).thenAnswer(i -> i.getArgument(0));
        when(users.save(any())).thenAnswer(i -> i.getArgument(0));
        when(encoder.encode(anyString())).thenReturn("hash");
    }

    @Test
    void reportsUsers() {
        when(users.count()).thenReturn(1L);
        assertTrue(service.hasUsers());
        when(users.count()).thenReturn(0L);
        assertFalse(service.hasUsers());
    }

    @Test
    void registersNormalizedUserAndDefaultRole() {
        Role role = mock(Role.class);
        when(roles.findByName("USER")).thenReturn(Optional.of(role));
        User user = service.registerUser(" Ana ", " ANA@MAIL.COM ", "secret", null, null);
        assertEquals("ana@mail.com", user.getEmail());
        assertSame(role, user.getRole());
    }

    @Test
    void createsMissingNamedRole() {
        when(roles.findByName("ADMIN")).thenReturn(Optional.empty());
        when(roles.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals("ADMIN", service.registerUser("Ana", "a@b.com", "secret", " admin ", null).getRole().getName());
    }

    @Test
    void rejectsDuplicate() {
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(mock(User.class)));
        assertThrows(IllegalArgumentException.class, () -> service.registerUser("A", "a@b.com", "x", null, null));
    }

    @Test
    void authenticatesAndRejectsPassword() {
        User user = mock(User.class);
        when(user.getPasswordHash()).thenReturn("hash");
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(encoder.matches("ok", "hash")).thenReturn(true);
        assertSame(user, service.authenticate(" A@B.COM ", "ok").orElseThrow());
        verify(user).registerAccess();
        assertTrue(service.authenticate("a@b.com", "bad").isEmpty());
    }

    @Test
    void changesPasswords() {
        UUID id = UUID.randomUUID();
        UUID actor = UUID.randomUUID();
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(users.findById(id)).thenReturn(Optional.of(user));
        service.changePassword(id, "new", actor);
        verify(user).changePassword("hash", actor);
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        service.changePasswordByEmail("A@B.COM", "new");
        verify(user).changePassword("hash", id);
    }

    @Test
    void rejectsPasswordChanges() {
        UUID id = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class, () -> service.changePassword(id, "x", id));
        assertThrows(IllegalArgumentException.class, () -> service.changePasswordByEmail("x@y.com", "x"));
    }

    @Test
    void updatesProfileWithOptionalPassword() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        Human human = mock(Human.class);
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(user.getHuman()).thenReturn(human);
        when(users.save(user)).thenReturn(user);
        assertSame(user, service.updateUserProfile(id, " Ana ", " A@B.COM ", "123456", null));
        verify(user).changeEmail("a@b.com", id);
        verify(user).changePassword("hash", id);
        assertSame(user, service.updateUserProfile(id, "Ana", "a@b.com", null, null));
    }

    @Test
    void findsFirstAndByEmail() {
        User user = mock(User.class);
        when(users.findAll()).thenReturn(List.of(user));
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        assertSame(user, service.firstUser());
        assertSame(user, service.findByEmail(" A@B.COM "));
        when(users.findAll()).thenReturn(List.of());
        assertThrows(IllegalStateException.class, service::firstUser);
        assertThrows(IllegalArgumentException.class, () -> service.findByEmail("x@y.com"));
    }

    @Test
    void onboardingCompletesSuccessfully() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        Human human = mock(Human.class);
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(user.getHuman()).thenReturn(human);
        when(users.save(user)).thenReturn(user);

        java.time.LocalDate bDate = java.time.LocalDate.of(2000, 1, 1);
        assertSame(user, service.completeOnboarding(id, "Ana", bDate, true, "Computer Science", 4, "ana_silva"));

        verify(human).updateOnboarding("Ana", bDate, true, "Computer Science", 4, id);
        verify(human).setUsername("ana_silva");
        verify(user).completeOnboarding(id);
        verify(humans).save(human);
    }

    @Test
    void onboardingFailsIfUserNotFound() {
        UUID id = UUID.randomUUID();
        when(users.findById(id)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> 
            service.completeOnboarding(id, "Ana", null, true, "CS", 1, "ana_silva")
        );
    }

    @Test
    void fullProfileUpdatesSuccess() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        Human human = mock(Human.class);
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(user.getHuman()).thenReturn(human);
        when(users.save(user)).thenReturn(user);

        br.ufpb.dsc.nexushub.model.people.domain.Technology tech = 
                mock(br.ufpb.dsc.nexushub.model.people.domain.Technology.class);
        when(technologies.findByName("Java")).thenReturn(Optional.of(tech));

        br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest req = new br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest(
            "ana_silva", "Ana", "a@b.com", "newpassword", "my bio", "http://photo",
            java.time.LocalDate.of(2000, 1, 1), 1, null, true,
            "CS", 3, "12345", "2021.1", "2025.2", "9999", "git", "insta", "link", "web",
            true, true, true, true, true, "exp", "edu", "cert", List.of("Java")
        );

        assertSame(user, service.updateFullProfile(id, req));

        verify(user).changeEmail("a@b.com", id);
        verify(user).changePassword("hash", id);
        verify(human).updatePersonalDetails("Ana", "my bio", "http://photo", java.time.LocalDate.of(2000, 1, 1), 1, null, id);
        verify(human).setUsername("ana_silva");
        verify(human).updateAcademicDetails("CS", "12345", "2021.1", "2025.2", id);
        verify(human).updateContacts("9999", "git", "insta", "link", "web", id);
        verify(human).updateNotifications(true, true, true, true, true, id);
        verify(human).updateExperienceSections("exp", "edu", "cert", id);
        verify(human).setTechnologies(anySet());
        verify(humans).save(human);
    }

    @Test
    void fullProfileUpdatesWithoutPasswordAndNewTech() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        Human human = mock(Human.class);
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(user.getHuman()).thenReturn(human);
        when(users.save(user)).thenReturn(user);

        when(technologies.findByName("NewTech")).thenReturn(Optional.empty());
        when(technologies.save(any())).thenAnswer(i -> i.getArgument(0));

        br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest req = new br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest(
            "ana_silva", "Ana", "a@b.com", null, "my bio", "http://photo",
            java.time.LocalDate.of(2000, 1, 1), 1, null, true,
            "CS", 3, "12345", "2021.1", "2025.2", "9999", "git", "insta", "link", "web",
            true, true, true, true, true, "exp", "edu", "cert", List.of("NewTech", " ")
        );

        assertSame(user, service.updateFullProfile(id, req));
        verify(user, never()).changePassword(anyString(), any());
        verify(technologies).save(any());
    }

    @Test
    void fullProfileUpdatesFailsIfUserNotFound() {
        UUID id = UUID.randomUUID();
        br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest req = new br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest(
            "ana_silva", "Ana", "a@b.com", null, null, null, null, null, null, true,
            null, null, null, null, null, null, null, null, null, null,
            true, true, true, true, true, null, null, null, null
        );
        when(users.findById(id)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.updateFullProfile(id, req));
    }

    @Test
    void processGoogleLoginForExistingUserSuccess() {
        String email = "existing@b.com";
        User user = mock(User.class);
        Human human = mock(Human.class);
        when(user.getHuman()).thenReturn(human);
        when(human.getPhotoUrl()).thenReturn("");
        when(users.findByEmail(email)).thenReturn(Optional.of(user));

        assertSame(user, service.processGoogleLogin(email, "Google User", "http://photo"));
        verify(human).setPhotoUrl("http://photo");
        verify(humans).save(human);
    }

    @Test
    void processGoogleLoginForNewUserSuccess() {
        String email = "new@b.com";
        when(users.findByEmail(email)).thenReturn(Optional.empty());
        
        Role role = mock(Role.class);
        when(roles.findByName("USER")).thenReturn(Optional.of(role));
        
        when(humans.save(any(Human.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = service.processGoogleLogin(email, "New User", "http://newphoto");
        
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals("New User", result.getHuman().getName());
        assertEquals("http://newphoto", result.getHuman().getPhotoUrl());
    }
}
