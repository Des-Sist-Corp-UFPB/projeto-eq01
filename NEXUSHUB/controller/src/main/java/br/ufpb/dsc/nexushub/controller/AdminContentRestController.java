package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.domain.BannedWord;
import br.ufpb.dsc.nexushub.model.administration.domain.ReportTicket;
import br.ufpb.dsc.nexushub.model.administration.service.AdminContentService;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/content")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
public class AdminContentRestController {

    private final AdminContentService contentService;

    public AdminContentRestController(AdminContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/tickets")
    public List<ReportTicket> getPendingTickets() {
        return contentService.listPendingTickets();
    }

    @PostMapping("/tickets/{id}/decide")
    public Map<String, String> resolveTicket(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String action = body.getOrDefault("action", "ARCHIVED"); // RESOLVED (deletes content), ARCHIVED (keeps)
        contentService.resolveTicket(id, action, UUID.randomUUID());
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Denúncia moderada com a decisão: " + action);
        return res;
    }

    @PostMapping("/report")
    public ReportTicket submitReport(@RequestBody Map<String, String> body) {
        String type = body.get("targetType");
        UUID targetId = UUID.fromString(body.get("targetId"));
        String reason = body.get("reason");
        return contentService.report(type, targetId, reason);
    }

    @GetMapping("/banned-words")
    public List<BannedWord> getBannedWords() {
        return contentService.listBannedWords();
    }

    @PostMapping("/banned-words")
    public BannedWord addWord(@RequestBody Map<String, String> body) {
        return contentService.addBannedWord(body.get("word"));
    }

    @DeleteMapping("/banned-words/{id}")
    public Map<String, String> removeWord(@PathVariable UUID id) {
        contentService.removeBannedWord(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "DELETED");
        return res;
    }
}
