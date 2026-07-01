package br.ufpb.dsc.nexushub.model.identity.service.impl;

import br.ufpb.dsc.nexushub.model.identity.domain.Role;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.RoleRepository;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityServiceImpl implements IdentityService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final HumanRepository humanRepository;
    private final PasswordEncoder passwordEncoder;

    public IdentityServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            HumanRepository humanRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.humanRepository = humanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUsers() {
        return userRepository.count() > 0;
    }

    @Override
    @Transactional
    public User registerUser(String name, String email, String rawPassword, String roleName, String fotoUrl) {
        String normalizedEmail = normalizeEmail(email);
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            throw new IllegalArgumentException("Este e-mail ja esta cadastrado.");
        });

        UUID userId = UUID.randomUUID();
        Role role = roleRepository.findByName(resolveRoleName(roleName))
                .orElseGet(() -> roleRepository.save(new Role(resolveRoleName(roleName), "Default role", 1, userId)));

        Human human = new Human(UUID.randomUUID(), name.trim(), normalizedEmail, userId);
        if (fotoUrl != null) {
            human.setPhotoUrl(fotoUrl);
        }
        human = humanRepository.save(human);
        User user = new User(userId, human, role, normalizedEmail, passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public Optional<User> authenticate(String email, String rawPassword) {
        Optional<User> user = userRepository.findByEmail(normalizeEmail(email))
                .filter(found -> passwordEncoder.matches(rawPassword, found.getPasswordHash()));
        user.ifPresent(User::registerAccess);
        return user;
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String rawPassword, UUID updatedById) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));
        user.changePassword(passwordEncoder.encode(rawPassword), updatedById);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePasswordByEmail(String email, String rawPassword) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Nenhum usuario cadastrado com este e-mail."));
        changePassword(user.getId(), rawPassword, user.getId());
    }

    @Override
    @Transactional
    public User updateUserProfile(UUID userId, String name, String email, String rawPassword, String fotoUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));
        String normalizedEmail = normalizeEmail(email);
        user.changeEmail(normalizedEmail, userId);
        user.getHuman().updateProfile(name.trim(), normalizedEmail, null, null, null, userId);
        if (fotoUrl != null) {
            user.getHuman().setPhotoUrl(fotoUrl);
        }
        if (rawPassword != null && rawPassword.trim().length() >= 6) {
            user.changePassword(passwordEncoder.encode(rawPassword.trim()), userId);
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User firstUser() {
        return userRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Nenhum usuario auditor encontrado."));
    }

    @Override
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String resolveRoleName(String roleName) {
        return roleName == null || roleName.isBlank() ? "STUDENT" : roleName.trim().toUpperCase();
    }
}
