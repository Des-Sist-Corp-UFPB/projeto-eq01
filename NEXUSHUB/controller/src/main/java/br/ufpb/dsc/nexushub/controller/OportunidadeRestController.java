package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.*;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import br.ufpb.dsc.nexushub.model.opportunities.service.OpportunityService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oportunidades")
public class OportunidadeRestController {

    private final OpportunityService opportunityService;
    private final IdentityService identityService;

    public OportunidadeRestController(OpportunityService opportunityService, IdentityService identityService) {
        this.opportunityService = opportunityService;
        this.identityService = identityService;
    }

    @GetMapping
    public ResponseEntity<List<OportunidadeResponse>> listar() {
        return ResponseEntity.ok(opportunityService.listOpenOpportunities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OportunidadeResponse> obterPorId(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(opportunityService.getOpportunityDetails(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody OportunidadeCadastroRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            Opportunity o = opportunityService.createOpportunity(user.getHuman().getId(), request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(OportunidadeResponse.from(o));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody OportunidadeCadastroRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            Opportunity o = opportunityService.updateOpportunity(id, request, user.getId());
            return ResponseEntity.ok(OportunidadeResponse.from(o));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable UUID id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            opportunityService.deleteOpportunity(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/{id}/denunciar")
    public ResponseEntity<?> denunciar(@PathVariable UUID id, @RequestBody ReportRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            opportunityService.reportOpportunity(id, request.motivo(), user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/{id}/candidatar")
    public ResponseEntity<?> candidatar(@PathVariable UUID id, @Valid @RequestBody CandidaturaRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            OpportunityApplication app = opportunityService.applyWithAnswers(id, user.getHuman().getId(), request, user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            User user = identityService.findByEmail(principal.getName());
            List<OportunidadeDashboardResponse> dash = opportunityService.listCreatorDashboard(user.getHuman().getId());
            return ResponseEntity.ok(dash);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    public record ErrorDto(String message) {}
    public record ReportRequest(String motivo) {}
}
