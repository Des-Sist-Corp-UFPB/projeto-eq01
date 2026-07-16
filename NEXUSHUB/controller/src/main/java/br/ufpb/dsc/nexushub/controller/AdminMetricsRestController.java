package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.administration.service.AdminMetricsService;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
public class AdminMetricsRestController {

    private final AdminMetricsService metricsService;

    public AdminMetricsRestController(AdminMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/engagement")
    public Map<String, Object> getEngagement() {
        return metricsService.getEngagementStats();
    }

    @GetMapping("/retention")
    public Map<String, Object> getRetention() {
        return metricsService.getRetentionStats();
    }

    @GetMapping("/courses")
    public Map<String, Long> getCourses() {
        return metricsService.getEngagementByCourse();
    }
}
