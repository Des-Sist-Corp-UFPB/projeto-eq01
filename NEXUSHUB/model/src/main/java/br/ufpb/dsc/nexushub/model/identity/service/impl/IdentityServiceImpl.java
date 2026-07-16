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
    private final br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository technologyRepository;

    public IdentityServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            HumanRepository humanRepository,
            PasswordEncoder passwordEncoder,
            br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository technologyRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.humanRepository = humanRepository;
        this.passwordEncoder = passwordEncoder;
        this.technologyRepository = technologyRepository;
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

        String cleanRoleName = roleName == null ? "" : roleName.trim().toUpperCase();
        String cargoRoleName = "USER";
        String userType = "Aluno";

        if ("PROFESSOR".equals(cleanRoleName)) {
            cargoRoleName = "USER";
            userType = "Professor";
        } else if ("SYSADMIN".equals(cleanRoleName) || "ADMIN".equals(cleanRoleName)) {
            cargoRoleName = "ADMIN";
            userType = "Técnico";
        } else if ("TECNICO".equals(cleanRoleName) || "ADMINISTRATIVO".equals(cleanRoleName) || "ADMINISTRATIVE".equals(cleanRoleName)) {
            cargoRoleName = "USER";
            userType = "Técnico";
        } else {
            cargoRoleName = "USER";
            userType = "Aluno";
        }

        String resolvedCargo = cargoRoleName;
        Role role = roleRepository.findByName(resolvedCargo)
                .orElseGet(() -> roleRepository.save(new Role(resolvedCargo, resolvedCargo + " role", 1, userId)));

        String autoUsername = generateUniqueUsername(name, normalizedEmail);
        Human human = new Human(UUID.randomUUID(), name.trim(), normalizedEmail, autoUsername, userId);
        human.setUserType(userType);
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
    @Transactional
    public User completeOnboarding(UUID userId, String nome, java.time.LocalDate birthDate, boolean showBirthday, String course, Integer period, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));
        
        String cleanUsername = username == null ? "" : username.trim().toLowerCase().replaceAll("[^a-zA-Z0-9_.]", "");
        if (cleanUsername.isEmpty()) {
            throw new IllegalArgumentException("Username não pode ser vazio.");
        }
        
        java.util.Optional<Human> existingHuman = humanRepository.findByUsername(cleanUsername);
        if (existingHuman.isPresent() && !existingHuman.get().getId().equals(user.getHuman().getId())) {
            throw new IllegalArgumentException("Este username já está em uso.");
        }
        
        user.getHuman().updateOnboarding(nome, birthDate, showBirthday, course, period, userId);
        user.getHuman().setUsername(cleanUsername);
        user.completeOnboarding(userId);
        humanRepository.save(user.getHuman());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateFullProfile(UUID userId, br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado."));

        String normalizedEmail = normalizeEmail(request.email());
        user.changeEmail(normalizedEmail, userId);
        if (request.senha() != null && request.senha().trim().length() >= 6) {
            user.changePassword(passwordEncoder.encode(request.senha().trim()), userId);
        }

        Human human = user.getHuman();
        String cleanUsername = request.username() == null ? "" : request.username().trim().toLowerCase().replaceAll("[^a-zA-Z0-9_.]", "");
        if (cleanUsername.isEmpty()) {
            cleanUsername = human.getUsername();
        }
        
        java.util.Optional<Human> existingHuman = humanRepository.findByUsername(cleanUsername);
        if (existingHuman.isPresent() && !existingHuman.get().getId().equals(human.getId())) {
            throw new IllegalArgumentException("Este username já está em uso.");
        }

        human.updatePersonalDetails(
                request.nome().trim(),
                request.bio(),
                request.fotoUrl(),
                request.birthDate(),
                request.genderType(),
                request.genderOther(),
                userId
        );

        human.updateOnboarding(request.nome().trim(), request.birthDate(), request.showBirthday(), request.course(), request.period(), userId);
        human.setUsername(cleanUsername);
        human.updateAcademicDetails(
                request.course(),
                request.matricula(),
                request.ingressPeriod(),
                request.conclusionPeriod(),
                userId
        );
        human.updateContacts(
                request.whatsapp(),
                request.githubUrl(),
                request.instagramUrl(),
                request.linkedinUrl(),
                request.websiteUrl(),
                userId
        );
        human.updateNotifications(
                request.notifRecommendations(),
                request.notifApplications(),
                request.notifAnnouncements(),
                request.notifEdicts(),
                request.notifAdmin(),
                userId
        );
        human.updateExperienceSections(
                request.experience(),
                request.education(),
                request.certification(),
                userId
        );

        java.util.Set<br.ufpb.dsc.nexushub.model.people.domain.Technology> techSet = new java.util.HashSet<>();
        if (request.technologies() != null) {
            for (String tName : request.technologies()) {
                if (tName == null || tName.trim().isBlank()) continue;
                String cleanName = tName.trim();
                br.ufpb.dsc.nexushub.model.people.domain.Technology tech = technologyRepository.findByName(cleanName)
                        .orElseGet(() -> technologyRepository.save(new br.ufpb.dsc.nexushub.model.people.domain.Technology(cleanName, userId)));
                techSet.add(tech);
            }
        }
        human.setTechnologies(techSet);

        humanRepository.save(human);
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

    @Override
    @Transactional
    public User processGoogleLogin(String email, String name, String photoUrl) {
        String normalizedEmail = normalizeEmail(email);
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            Human human = user.getHuman();
            if (human != null) {
                boolean changed = false;
                if (human.getPhotoUrl() == null || human.getPhotoUrl().isEmpty()) {
                    human.setPhotoUrl(photoUrl);
                    changed = true;
                }
                if (changed) {
                    humanRepository.save(human);
                }
            }
            return user;
        }

        UUID userId = UUID.randomUUID();
        String cargoRoleName = "USER";
        String userType = "Aluno";

        Role role = roleRepository.findByName(cargoRoleName)
                .orElseGet(() -> roleRepository.save(new Role(cargoRoleName, cargoRoleName + " role", 1, userId)));

        String autoUsername = generateUniqueUsername(name, normalizedEmail);
        Human human = new Human(UUID.randomUUID(), name.trim(), normalizedEmail, autoUsername, userId);
        human.setUserType(userType);
        if (photoUrl != null) {
            human.setPhotoUrl(photoUrl);
        }
        human = humanRepository.save(human);

        String randomPassword = UUID.randomUUID().toString();
        User user = new User(userId, human, role, normalizedEmail, passwordEncoder.encode(randomPassword));
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        Human human = humanRepository.findByUsername(username.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        return userRepository.findById(human.getId())
                .orElseThrow(() -> new IllegalArgumentException("Dados de autenticação não encontrados para o perfil."));
    }

    private String generateUniqueUsername(String name, String email) {
        String base = "";
        if (email != null && email.contains("@")) {
            base = email.substring(0, email.indexOf("@")).replaceAll("[^a-zA-Z0-9_.]", "");
        } else if (name != null) {
            base = name.trim().toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_.]", "");
        }
        if (base.isEmpty()) {
            base = "user";
        }
        
        String username = base;
        int count = 1;
        while (humanRepository.existsByUsername(username)) {
            username = base + count;
            count++;
        }
        return username;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String resolveRoleName(String roleName) {
        return roleName == null || roleName.isBlank() ? "STUDENT" : roleName.trim().toUpperCase();
    }
}
