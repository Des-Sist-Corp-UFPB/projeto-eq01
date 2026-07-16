package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.domain.ModerationCase;
import br.ufpb.dsc.nexushub.model.administration.repository.ModerationCaseRepository;
import br.ufpb.dsc.nexushub.model.administration.service.AdministrationService;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.Notification;
import br.ufpb.dsc.nexushub.model.people.domain.Post;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.people.repository.NotificationRepository;
import br.ufpb.dsc.nexushub.model.people.repository.PostRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ModerationRestController {

    private final ModerationCaseRepository moderationCaseRepository;
    private final IdentityService identityService;
    private final PostRepository postRepository;
    private final AdministrationService administrationService;
    private final NotificationRepository notificationRepository;
    private final HumanRepository humanRepository;

    public ModerationRestController(
            ModerationCaseRepository moderationCaseRepository,
            IdentityService identityService,
            PostRepository postRepository,
            AdministrationService administrationService,
            NotificationRepository notificationRepository,
            HumanRepository humanRepository
    ) {
        this.moderationCaseRepository = moderationCaseRepository;
        this.identityService = identityService;
        this.postRepository = postRepository;
        this.administrationService = administrationService;
        this.notificationRepository = notificationRepository;
        this.humanRepository = humanRepository;
    }

    @PostMapping("/moderacao/denunciar")
    @Transactional
    public ResponseEntity<?> reportContent(@Valid @RequestBody ReportRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User reporter = identityService.findByEmail(principal.getName());
        
        String targetType = request.targetType().trim().toUpperCase();
        if (!"POST".equals(targetType) && !"USER".equals(targetType)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Tipo de alvo inválido."));
        }

        ModerationCase caseItem = new ModerationCase(reporter.getHuman(), targetType, request.targetId(), request.reason());
        moderationCaseRepository.save(caseItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("Denúncia registrada com sucesso."));
    }

    @GetMapping("/admin/moderacao/denuncias")
    public ResponseEntity<?> listPendingReports(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User admin = identityService.findByEmail(principal.getName());
        if (!"ADMIN".equals(admin.getRole().getName()) && !"SYSADMIN".equals(admin.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ModerationCaseResponse> list = moderationCaseRepository.findAllByStatusOrderByCreatedTimeDesc("PENDING")
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/moderacao/denuncias/{id}/decidir")
    @Transactional
    public ResponseEntity<?> decideReport(
            @PathVariable UUID id,
            @Valid @RequestBody DecisionRequest request,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User admin = identityService.findByEmail(principal.getName());
        if (!"ADMIN".equals(admin.getRole().getName()) && !"SYSADMIN".equals(admin.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ModerationCase mc = moderationCaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caso de moderação não encontrado."));

        if (!"PENDING".equals(mc.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Este caso já foi julgado."));
        }

        String decision = request.decision().trim().toUpperCase(); // APPROVED or REJECTED
        if (!"APPROVED".equals(decision) && !"REJECTED".equals(decision)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Decisão inválida."));
        }

        mc.review(admin.getHuman(), decision);
        moderationCaseRepository.save(mc);

        // Execute action if APPROVED
        if ("APPROVED".equals(decision)) {
            if ("POST".equals(mc.getTargetType())) {
                postRepository.findById(mc.getTargetId()).ifPresent(post -> {
                    post.deactivate(admin.getId());
                    postRepository.save(post);
                });
            } else if ("USER".equals(mc.getTargetType())) {
                try {
                    administrationService.active(mc.getTargetId(), false, admin.getId());
                } catch (Exception e) {
                    // Suppress or handle if already blocked or self-block attempt
                }
            }
        }

        // Notify the reporter
        String targetName = "POST".equals(mc.getTargetType()) ? "publicação" : "perfil de usuário";
        String notificationMessage;
        if ("APPROVED".equals(decision)) {
            notificationMessage = "Sua denúncia contra um(a) " + targetName + " foi analisada e aceita. O conteúdo foi removido/bloqueado.";
        } else {
            notificationMessage = "Sua denúncia contra um(a) " + targetName + " foi analisada e rejeitada. O conteúdo foi mantido.";
        }

        notificationRepository.save(new Notification(mc.getReporter(), notificationMessage));

        return ResponseEntity.ok(new MessageResponse("Decisão registrada e denunciante notificado."));
    }

    private ModerationCaseResponse toResponse(ModerationCase mc) {
        String reportedName = "Desconhecido";
        String contextContent = "";

        if ("POST".equals(mc.getTargetType())) {
            var postOpt = postRepository.findById(mc.getTargetId());
            if (postOpt.isPresent()) {
                reportedName = postOpt.get().getAuthor().getName();
                contextContent = postOpt.get().getContent();
            }
        } else if ("USER".equals(mc.getTargetType())) {
            var humanOpt = humanRepository.findById(mc.getTargetId());
            if (humanOpt.isPresent()) {
                reportedName = humanOpt.get().getName() + " (@" + humanOpt.get().getUsername() + ")";
                contextContent = humanOpt.get().getBio() != null ? humanOpt.get().getBio() : "Sem biografia.";
            }
        }

        return new ModerationCaseResponse(
                mc.getId(),
                mc.getReporter().getName(),
                mc.getTargetType(),
                mc.getTargetId(),
                reportedName,
                contextContent,
                mc.getReason(),
                mc.getStatus(),
                mc.getCreatedTime()
        );
    }

    public record ReportRequest(
            @NotBlank String targetType,
            @NotNull UUID targetId,
            @NotBlank String reason
    ) {}

    public record DecisionRequest(
            @NotBlank String decision
    ) {}

    public record MessageResponse(String message) {}
    public record ErrorResponse(String error) {}

    public record ModerationCaseResponse(
            UUID id,
            String reporterName,
            String targetType,
            UUID targetId,
            String reportedName,
            String contextContent,
            String reason,
            String status,
            LocalDateTime createdTime
    ) {}
}
