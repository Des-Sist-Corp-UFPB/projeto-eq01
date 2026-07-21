package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.administration.service.AuditService;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final IdentityService identityService;
    private final AuditService auditService;
    private final br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository technologyRepository;
    private final br.ufpb.dsc.nexushub.model.people.service.FeedService feedService;
    private final br.ufpb.dsc.nexushub.model.people.repository.TestimonialRepository testimonialRepository;
    private final br.ufpb.dsc.nexushub.model.people.repository.FollowRepository followRepository;
    private final br.ufpb.dsc.nexushub.model.people.repository.NotificationRepository notificationRepository;
    private final br.ufpb.dsc.nexushub.model.privacy.service.PrivacyService privacyService;
    private final br.ufpb.dsc.nexushub.model.people.repository.HumanRepository humanRepository;
    private final br.ufpb.dsc.nexushub.model.projects.repository.ProjectHumanMemberRepository projectHumanMemberRepository;
    private final br.ufpb.dsc.nexushub.model.identity.repository.UserRepository userRepository;
    private final String googleClientId;

    public UsuarioRestController(IdentityService identityService, AuditService auditService, 
                                 br.ufpb.dsc.nexushub.model.people.repository.TechnologyRepository technologyRepository,
                                 br.ufpb.dsc.nexushub.model.people.service.FeedService feedService,
                                 br.ufpb.dsc.nexushub.model.people.repository.TestimonialRepository testimonialRepository,
                                 br.ufpb.dsc.nexushub.model.people.repository.FollowRepository followRepository,
                                 br.ufpb.dsc.nexushub.model.people.repository.NotificationRepository notificationRepository,
                                 br.ufpb.dsc.nexushub.model.privacy.service.PrivacyService privacyService,
                                 br.ufpb.dsc.nexushub.model.people.repository.HumanRepository humanRepository,
                                 br.ufpb.dsc.nexushub.model.projects.repository.ProjectHumanMemberRepository projectHumanMemberRepository,
                                 br.ufpb.dsc.nexushub.model.identity.repository.UserRepository userRepository,
                                 @Value("${app.google.client-id}") String googleClientId) {
        this.identityService = identityService;
        this.auditService = auditService;
        this.technologyRepository = technologyRepository;
        this.feedService = feedService;
        this.testimonialRepository = testimonialRepository;
        this.followRepository = followRepository;
        this.notificationRepository = notificationRepository;
        this.privacyService = privacyService;
        this.humanRepository = humanRepository;
        this.projectHumanMemberRepository = projectHumanMemberRepository;
        this.userRepository = userRepository;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody UsuarioCadastroRequest request, HttpServletRequest httpRequest) {
        try {
            if (request.senha() == null || request.senha().trim().length() < 6) {
                throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres.");
            }
            if (request.lgpdConsent() == null || !request.lgpdConsent()) {
                throw new IllegalArgumentException("O consentimento dos termos e LGPD é obrigatório.");
            }
            User user = identityService.registerUser(request.nome(), request.email(), request.senha(), request.cargo(), request.fotoUrl());
            privacyService.consent(user.getId(), "TERMS_AND_PRIVACY", "1.0", true);
            audit(user.getId(), "USER_REGISTERED", user.getId().toString(), "SUCCESS", httpRequest, "role=" + user.getRole().getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return identityService.authenticate(request.email(), request.senha())
                .<ResponseEntity<?>>map(user -> {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())));
                    var context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                    httpRequest.getSession(true).setAttribute(
                            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
                    audit(user.getId(), "LOGIN", user.getId().toString(), "SUCCESS", httpRequest, null);
                    return ResponseEntity.ok(UsuarioResponse.from(user));
                })
                .orElseGet(() -> {
                    audit(null, "LOGIN_FAILED", null, "DENIED", httpRequest, null);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto("E-mail ou senha incorretos."));
                });
    }

    @GetMapping("/sessao")
    public ResponseEntity<?> sessao(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(UsuarioResponse.from(identityService.findByEmail(principal.getName())));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        try {
            identityService.changePasswordByEmail(request.email(), request.novaSenha());
            User user = identityService.findByEmail(request.email());
            audit(user.getId(), "PASSWORD_CHANGED", user.getId().toString(), "SUCCESS", httpRequest, null);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PutMapping("/perfil/{id}")
    @Transactional
    public ResponseEntity<?> atualizarPerfil(
            @PathVariable UUID id,
            @Valid @RequestBody br.ufpb.dsc.nexushub.model.dto.PerfilUpdateRequest request,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean shareOnFeed,
            HttpServletRequest httpRequest
    ) {
        try {
            User user = identityService.updateFullProfile(id, request);
            audit(id, "PROFILE_UPDATED", id.toString(), "SUCCESS", httpRequest, null);

            if (shareOnFeed) {
                StringBuilder msg = new StringBuilder();
                if (request.technologies() != null && !request.technologies().isEmpty()) {
                    msg.append("Adicionou competências ao perfil: ")
                       .append(String.join(", ", request.technologies()));
                } else if (request.bio() != null && !request.bio().trim().isEmpty()) {
                    msg.append("Atualizou sua biografia: \"")
                       .append(request.bio().trim())
                       .append("\"");
                } else {
                    msg.append("Atualizou suas informações de perfil acadêmico.");
                }
                feedService.createPost(user.getHuman().getId(), msg.toString(), null, "USER", user.getId());
            }

            return ResponseEntity.ok(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/onboarding/{id}")
    public ResponseEntity<?> completarOnboarding(@PathVariable UUID id, @Valid @RequestBody OnboardingRequest request,
                                                 HttpServletRequest httpRequest) {
        try {
            if (request.lgpdConsent() == null || !request.lgpdConsent()) {
                throw new IllegalArgumentException("O consentimento dos termos e LGPD é obrigatório.");
            }
            User user = identityService.completeOnboarding(id, request.nome(), request.birthDate(), request.showBirthday(), request.course(), request.period(), request.username());
            privacyService.consent(user.getId(), "TERMS_AND_PRIVACY", "1.0", true);
            audit(id, "ONBOARDING_COMPLETED", id.toString(), "SUCCESS", httpRequest, null);
            return ResponseEntity.ok(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/login-google")
    public ResponseEntity<?> loginGoogle(@RequestBody java.util.Map<String, String> payload, HttpServletRequest httpRequest) {
        String token = payload.get("token");
        try {
            var verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(), new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto("Token do Google inválido."));
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload googlePayload = idToken.getPayload();
            String email = googlePayload.getEmail();
            String nome = (String) googlePayload.get("name");
            String fotoUrl = (String) googlePayload.get("picture");

            User user = identityService.processGoogleLogin(email, nome, fotoUrl);

            var authentication = new UsernamePasswordAuthenticationToken(
                    user.getEmail(), null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())));
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            httpRequest.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            audit(user.getId(), "LOGIN_GOOGLE", user.getId().toString(), "SUCCESS", httpRequest, null);
            return ResponseEntity.ok(UsuarioResponse.from(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorDto("Erro ao autenticar com o Google."));
        }
    }

    @GetMapping("/tecnologias")
    @org.springframework.cache.annotation.Cacheable("tecnologias")
    public ResponseEntity<?> listarTecnologias() {
        java.util.List<String> list = technologyRepository.findAll().stream()
                .map(br.ufpb.dsc.nexushub.model.people.domain.Technology::getName)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/comunidade")
    public ResponseEntity<List<br.ufpb.dsc.nexushub.model.dto.PessoaCardResponse>> listarComunidade(java.security.Principal principal) {
        UUID currentHumanId = null;
        if (principal != null) {
            User currentUser = identityService.findByEmail(principal.getName());
            if (currentUser != null && currentUser.getHuman() != null) {
                currentHumanId = currentUser.getHuman().getId();
            }
        }

        final UUID loggedInHumanId = currentHumanId;

        List<br.ufpb.dsc.nexushub.model.dto.PessoaCardResponse> result = userRepository.findAll().stream()
            .map(u -> {
                br.ufpb.dsc.nexushub.model.people.domain.Human h = u.getHuman();

                UUID id = h != null ? h.getId() : u.getId();
                String name = (h != null && h.getName() != null && !h.getName().trim().isEmpty()) ? h.getName() : u.getUsername();
                String username = u.getUsername();
                String cargo = u.getRole() != null ? u.getRole().getName() : "USER";
                String userType = h != null ? h.getUserType() : "GERAL";
                String photoUrl = h != null ? h.getPhotoUrl() : null;
                String course = h != null ? h.getCourse() : null;
                String period = h != null ? h.getPeriod() : null;

                long projetosCount = h != null ? projectHumanMemberRepository.countByHumanId(h.getId()) : 0;
                long seguidoresCount = h != null ? followRepository.countByFollowingId(h.getId()) : 0;
                boolean isFollowing = false;
                if (loggedInHumanId != null && h != null) {
                    isFollowing = followRepository.existsByFollowerIdAndFollowingId(loggedInHumanId, h.getId());
                }

                return new br.ufpb.dsc.nexushub.model.dto.PessoaCardResponse(
                        id,
                        name,
                        username,
                        cargo,
                        userType,
                        photoUrl,
                        course,
                        period,
                        projetosCount,
                        seguidoresCount,
                        isFollowing
                );
            })
            .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> findByUsername(@PathVariable String username) {
        try {
            User user = identityService.findByUsername(username);
            return ResponseEntity.ok(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/username/{username}/posts")
    public ResponseEntity<?> findPostsByUsername(@PathVariable String username, java.security.Principal principal) {
        try {
            User user = identityService.findByUsername(username);
            UUID currentHumanId = null;
            if (principal != null) {
                User currentUser = identityService.findByEmail(principal.getName());
                currentHumanId = currentUser.getHuman().getId();
            }
            List<br.ufpb.dsc.nexushub.model.dto.PostResponse> posts = feedService.getPostsByAuthor(user.getHuman().getId(), currentHumanId);
            return ResponseEntity.ok(posts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/perfil/{username}/depoimentos")
    public ResponseEntity<?> createTestimonial(@PathVariable String username, @RequestBody java.util.Map<String, String> payload, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto("Conteúdo do depoimento é obrigatório."));
        }
        
        try {
            User sender = identityService.findByEmail(principal.getName());
            User receiver = identityService.findByUsername(username);
            
            br.ufpb.dsc.nexushub.model.people.domain.Testimonial testimonial = 
                new br.ufpb.dsc.nexushub.model.people.domain.Testimonial(receiver.getHuman(), sender.getHuman(), content.trim(), sender.getId());
            
            testimonialRepository.save(testimonial);
            
            // Notification for testimonial
            notificationRepository.save(new br.ufpb.dsc.nexushub.model.people.domain.Notification(
                receiver.getHuman(), sender.getHuman().getName() + " enviou um depoimento para você. Vá em Depoimentos para aprovar!"
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(br.ufpb.dsc.nexushub.model.dto.TestimonialResponse.from(testimonial));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/perfil/{username}/depoimentos")
    public ResponseEntity<?> listAcceptedTestimonials(@PathVariable String username) {
        try {
            User user = identityService.findByUsername(username);
            List<br.ufpb.dsc.nexushub.model.dto.TestimonialResponse> list = testimonialRepository
                .findAllByReceiverIdAndAcceptedAndRecordStatusOrderByUpdatedAtDesc(user.getHuman().getId(), true, 1)
                .stream()
                .map(br.ufpb.dsc.nexushub.model.dto.TestimonialResponse::from)
                .toList();
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/perfil/depoimentos/pendentes")
    public ResponseEntity<?> listPendingTestimonials(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = identityService.findByEmail(principal.getName());
        List<br.ufpb.dsc.nexushub.model.dto.TestimonialResponse> list = testimonialRepository
            .findAllByReceiverIdAndAcceptedAndRecordStatusOrderByUpdatedAtDesc(user.getHuman().getId(), false, 1)
            .stream()
            .map(br.ufpb.dsc.nexushub.model.dto.TestimonialResponse::from)
            .toList();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/perfil/depoimentos/{id}/aceitar")
    public ResponseEntity<?> acceptTestimonial(@PathVariable UUID id, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            
            br.ufpb.dsc.nexushub.model.people.domain.Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Depoimento não encontrado."));
            
            if (!testimonial.getReceiver().getId().equals(user.getHuman().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorDto("Apenas o destinatário pode aceitar este depoimento."));
            }
            
            testimonial.accept(user.getId());
            testimonialRepository.save(testimonial);
            return ResponseEntity.ok(br.ufpb.dsc.nexushub.model.dto.TestimonialResponse.from(testimonial));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @DeleteMapping("/perfil/depoimentos/{id}")
    public ResponseEntity<?> deleteTestimonial(@PathVariable UUID id, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            
            br.ufpb.dsc.nexushub.model.people.domain.Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Depoimento não encontrado."));
            
            if (!testimonial.getReceiver().getId().equals(user.getHuman().getId()) && 
                !testimonial.getSender().getId().equals(user.getHuman().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorDto("Permissão negada para excluir este depoimento."));
            }
            
            testimonialRepository.delete(testimonial);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/perfil/{username}/seguir")
    @Transactional
    public ResponseEntity<?> toggleFollow(@PathVariable String username, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User current = identityService.findByEmail(principal.getName());
            User target = identityService.findByUsername(username);
            
            if (current.getHuman().getId().equals(target.getHuman().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto("Você não pode seguir a si mesmo."));
            }
            
            java.util.Optional<br.ufpb.dsc.nexushub.model.people.domain.Follow> existing = 
                followRepository.findByFollowerIdAndFollowingId(current.getHuman().getId(), target.getHuman().getId());
            
            boolean following;
            if (existing.isPresent()) {
                followRepository.delete(existing.get());
                following = false;
            } else {
                followRepository.save(new br.ufpb.dsc.nexushub.model.people.domain.Follow(current.getHuman(), target.getHuman()));
                following = true;
                
                // Add follow notification
                notificationRepository.save(new br.ufpb.dsc.nexushub.model.people.domain.Notification(
                    target.getHuman(), current.getHuman().getName() + " começou a seguir você."
                ));
            }
            
            int followersCount = followRepository.countByFollowingId(target.getHuman().getId());
            int followingCount = followRepository.countByFollowerId(target.getHuman().getId());
            
            return ResponseEntity.ok(new FollowStatusResponse(following, followersCount, followingCount));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/perfil/{username}/seguir-status")
    public ResponseEntity<?> getFollowStatus(@PathVariable String username, java.security.Principal principal) {
        try {
            User target = identityService.findByUsername(username);
            boolean following = false;
            if (principal != null) {
                User current = identityService.findByEmail(principal.getName());
                following = followRepository.existsByFollowerIdAndFollowingId(current.getHuman().getId(), target.getHuman().getId());
            }
            int followersCount = followRepository.countByFollowingId(target.getHuman().getId());
            int followingCount = followRepository.countByFollowerId(target.getHuman().getId());
            return ResponseEntity.ok(new FollowStatusResponse(following, followersCount, followingCount));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/notificacoes")
    public ResponseEntity<?> listNotifications(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = identityService.findByEmail(principal.getName());
        List<NotificationResponse> list = notificationRepository.findAllByReceiverIdOrderByCreatedTimeDesc(user.getHuman().getId())
                .stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/notificacoes/{id}/ler")
    @Transactional
    public ResponseEntity<?> markNotificationRead(@PathVariable UUID id, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = identityService.findByEmail(principal.getName());
        
        br.ufpb.dsc.nexushub.model.people.domain.Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada."));
                
        if (!n.getReceiver().getId().equals(user.getHuman().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        n.markAsRead();
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }

    public record OnboardingRequest(
        @jakarta.validation.constraints.NotBlank String nome,
        @jakarta.validation.constraints.NotNull java.time.LocalDate birthDate,
        boolean showBirthday,
        @jakarta.validation.constraints.NotBlank String course,
        @jakarta.validation.constraints.NotBlank String period,
        @jakarta.validation.constraints.NotBlank String username,
        @jakarta.validation.constraints.NotNull Boolean lgpdConsent
    ) {}

    public record ErrorDto(String message) {
    }

    public record FollowStatusResponse(
        boolean following,
        int followersCount,
        int followingCount
    ) {}

    public record NotificationResponse(
        UUID id,
        String message,
        boolean read,
        java.time.LocalDateTime createdTime
    ) {
        public static NotificationResponse from(br.ufpb.dsc.nexushub.model.people.domain.Notification n) {
            return new NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedTime());
        }
    }

    private void audit(UUID actorId, String action, String entityId, String result,
                       HttpServletRequest request, String afterValue) {
        auditService.record(actorId, action, "USER", entityId, result, request.getRemoteAddr(),
                request.getHeader("X-Correlation-ID"), null, afterValue);
    }
}


