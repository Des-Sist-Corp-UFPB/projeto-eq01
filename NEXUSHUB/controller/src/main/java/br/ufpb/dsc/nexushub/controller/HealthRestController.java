package br.ufpb.dsc.nexushub.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthRestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping({"/ping", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        try {
            // Executa a query de verificação no banco de dados (SELECT 1)
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                return ResponseEntity.ok(Map.of(
                        "status", "ok",
                        "database", "up",
                        "service", "eq01",
                        "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString()
                ));
            } else {
                throw new RuntimeException("Database verification returned unexpected value");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "database", "down",
                    "details", e.getMessage(),
                    "service", "eq01",
                    "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString()
            ));
        }
    }
}


