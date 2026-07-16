package br.ufpb.dsc.nexushub.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthRestController {

    private final JdbcTemplate jdbcTemplate;

    public HealthRestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping({"/ping", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        try {
            jdbcTemplate.execute("SELECT 1");
            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "database", "up",
                    "service", "eq01",
                    "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", "error",
                    "database", "down",
                    "service", "eq01",
                    "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                    "message", "Database is not active: " + e.getMessage()
            ));
        }
    }
}



