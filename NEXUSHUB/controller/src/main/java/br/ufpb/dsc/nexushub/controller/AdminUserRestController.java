package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.service.AdministrationService;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import br.ufpb.dsc.nexushub.model.opportunities.repository.OpportunityApplicationRepository;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
public class AdminUserRestController {

    private final AdministrationService adminService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final OpportunityApplicationRepository applicationRepository;

    public AdminUserRestController(AdministrationService adminService,
                                   UserRepository userRepository,
                                   ProjectRepository projectRepository,
                                   OpportunityApplicationRepository applicationRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public List<UsuarioResponse> listAll() {
        return adminService.users().stream().map(UsuarioResponse::from).toList();
    }

    @PostMapping("/{id}/status")
    public UsuarioResponse changeStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        // Mock status logic using enabled / disabled active flag
        boolean enabled = "ACTIVE".equalsIgnoreCase(body.getOrDefault("status", "ACTIVE"));
        User user = adminService.active(id, enabled, UUID.randomUUID());
        return UsuarioResponse.from(user);
    }

    @PostMapping("/{id}/institutional-verification")
    public Map<String, Object> verifyInstitutional(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        boolean approved = body.getOrDefault("approved", false);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", id);
        result.put("approved", approved);
        result.put("status", approved ? "VERIFIED_DOCENTE" : "REJECTED");
        return result;
    }

    @GetMapping("/{id}/history")
    public Map<String, Object> getHistory(@PathVariable UUID id) {
        User u = userRepository.findById(id).orElse(null);
        UUID humanId = u != null && u.getHuman() != null ? u.getHuman().getId() : id;

        long projectsCount = projectRepository.findAll().stream()
                .filter(p -> p.getOwner() != null && humanId.equals(p.getOwner().getId()))
                .count();

        long applicationsCount = applicationRepository.findAll().stream()
                .filter(app -> app.getHuman() != null && humanId.equals(app.getHuman().getId()))
                .count();

        Map<String, Object> history = new LinkedHashMap<>();
        history.put("userId", id);
        history.put("createdProjects", projectsCount);
        history.put("opportunitiesApplied", applicationsCount);
        history.put("academicXP", projectsCount * 120);
        return history;
    }
}
