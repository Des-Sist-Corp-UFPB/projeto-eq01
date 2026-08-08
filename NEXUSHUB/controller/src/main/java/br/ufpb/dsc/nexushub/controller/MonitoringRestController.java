package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class MonitoringRestController {

    private final IdentityService identityService;
    private final JdbcTemplate jdbcTemplate;

    public MonitoringRestController(IdentityService identityService, JdbcTemplate jdbcTemplate) {
        this.identityService = identityService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getSystemMetrics(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User admin = identityService.findByEmail(principal.getName());
        if (!"ADMIN".equals(admin.getRole().getName()) && !"SYSADMIN".equals(admin.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 1. JVM Memory
        long freeMemory = Runtime.getRuntime().freeMemory();
        long totalMemory = Runtime.getRuntime().totalMemory();
        long maxMemory = Runtime.getRuntime().maxMemory();
        long usedMemory = totalMemory - freeMemory;

        // 2. CPU Load (Process & System)
        double systemCpuLoad = -1.0;
        double processCpuLoad = -1.0;
        try {
            java.lang.management.OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                com.sun.management.OperatingSystemMXBean sunBean = (com.sun.management.OperatingSystemMXBean) osBean;
                systemCpuLoad = sunBean.getCpuLoad() * 100;
                processCpuLoad = sunBean.getProcessCpuLoad() * 100;
            }
        } catch (Exception ignored) {}

        // 3. Thread count & Uptime
        int activeThreads = ManagementFactory.getThreadMXBean().getThreadCount();
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        // 4. Database Ping
        long dbPingMs = -1;
        String databaseStatus = "down";
        try {
            long startTime = System.currentTimeMillis();
            Integer val = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (val != null && val == 1) {
                dbPingMs = System.currentTimeMillis() - startTime;
                databaseStatus = "up";
            }
        } catch (Exception e) {
            databaseStatus = "down: " + e.getMessage();
        }

        return ResponseEntity.ok(Map.of(
                "jvm", Map.of(
                        "usedMemoryMb", usedMemory / (1024 * 1024),
                        "totalMemoryMb", totalMemory / (1024 * 1024),
                        "maxMemoryMb", maxMemory / (1024 * 1024),
                        "freeMemoryMb", freeMemory / (1024 * 1024),
                        "memoryUsagePct", ((double) usedMemory / totalMemory) * 100
                ),
                "cpu", Map.of(
                        "systemCpuPct", systemCpuLoad >= 0 ? systemCpuLoad : 0.0,
                        "processCpuPct", processCpuLoad >= 0 ? processCpuLoad : 0.0
                ),
                "threads", Map.of(
                        "activeCount", activeThreads
                ),
                "uptimeMs", uptimeMs,
                "database", Map.of(
                        "status", databaseStatus,
                        "pingMs", dbPingMs
                )
        ));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getCentralizedLogs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User admin = identityService.findByEmail(principal.getName());
        if (!"ADMIN".equals(admin.getRole().getName()) && !"SYSADMIN".equals(admin.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Path path = Paths.get("logs/nexushub.log");
        if (!Files.exists(path)) {
            return ResponseEntity.ok(List.of("Arquivo de log centralizado ainda não criado no caminho: logs/nexushub.log"));
        }

        try (Stream<String> linesStream = Files.lines(path)) {
            List<String> allLines = linesStream.collect(Collectors.toList());
            int total = allLines.size();
            int fromIndex = Math.max(0, total - 100);
            return ResponseEntity.ok(allLines.subList(fromIndex, total));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("Erro ao ler arquivo de logs: " + e.getMessage()));
        }
    }
}
