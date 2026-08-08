package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.domain.Badge;
import br.ufpb.dsc.nexushub.model.administration.domain.XpRule;
import br.ufpb.dsc.nexushub.model.administration.service.AdminGamificationService;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/gamification")
@PreAuthorize("hasRole('ADMIN')")
public class AdminGamificationRestController {

    private final AdminGamificationService gamificationService;

    public AdminGamificationRestController(AdminGamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/badges")
    public List<Badge> listBadges() {
        return gamificationService.listBadges();
    }

    @PostMapping("/badges")
    public Badge saveBadge(@RequestBody Badge badge) {
        return gamificationService.saveBadge(badge);
    }

    @DeleteMapping("/badges/{id}")
    public Map<String, String> deleteBadge(@PathVariable UUID id) {
        gamificationService.deleteBadge(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "DELETED");
        return res;
    }

    @GetMapping("/xp-rules")
    public List<XpRule> listRules() {
        return gamificationService.listXpRules();
    }

    @PostMapping("/xp-rules")
    public XpRule updateRule(@RequestBody Map<String, Object> body) {
        String key = (String) body.get("actionKey");
        int value = ((Number) body.get("xpValue")).intValue();
        return gamificationService.updateXpRule(key, value);
    }

    @GetMapping("/anomalies")
    public List<Map<String, Object>> getAnomalies() {
        return gamificationService.detectXpAnomalies();
    }
}
