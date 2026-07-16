package br.ufpb.dsc.nexushub.model.identity.service;

import br.ufpb.dsc.nexushub.model.identity.domain.User;
import java.util.Optional;
import java.util.UUID;

public interface IdentityService {

    boolean hasUsers();

    User registerUser(String name, String email, String rawPassword, String roleName, String fotoUrl);

    Optional<User> authenticate(String email, String rawPassword);

    void changePassword(UUID userId, String rawPassword, UUID updatedById);

    void changePasswordByEmail(String email, String rawPassword);

    User updateUserProfile(UUID userId, String name, String email, String rawPassword, String fotoUrl);

    User completeOnboarding(UUID userId, String nome, java.time.LocalDate birthDate, boolean showBirthday, String course, Integer period, String username);

    User updateFullProfile(UUID userId, br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest request);

    User firstUser();
    User findByEmail(String email);
    User findByUsername(String username);
    User processGoogleLogin(String email, String name, String photoUrl);
}
