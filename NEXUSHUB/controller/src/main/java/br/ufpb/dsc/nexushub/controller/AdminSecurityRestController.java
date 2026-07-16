package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import br.ufpb.dsc.nexushub.model.administration.service.AdminSecurityService;
import br.ufpb.dsc.nexushub.model.privacy.domain.DataSubjectRequest;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/security")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSecurityRestController {

    private final AdminSecurityService securityService;

    public AdminSecurityRestController(AdminSecurityService securityService) {
        this.securityService = securityService;
    }

    @GetMapping("/logs")
    public List<AuditLog> getLogs(@RequestParam(required = false) UUID actorId,
                                  @RequestParam(required = false) String action,
                                  @RequestParam(required = false) String ip) {
        return securityService.queryLogs(actorId, action, ip);
    }

    @GetMapping("/lgpd")
    public List<DataSubjectRequest> listLgpdRequests() {
        return securityService.listLgpdRequests();
    }

    @PostMapping("/lgpd/{id}/process")
    public Map<String, String> processLgpdRequest(@PathVariable UUID id) {
        securityService.processLgpdRequest(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "COMPLETED");
        res.put("message", "Requisição LGPD processada com sucesso.");
        return res;
    }

    @GetMapping("/alerts")
    public List<String> getAlerts() {
        return securityService.detectSecurityAlerts();
    }
}
