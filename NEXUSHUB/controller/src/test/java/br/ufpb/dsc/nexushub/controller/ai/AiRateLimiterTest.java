package br.ufpb.dsc.nexushub.controller.ai;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class AiRateLimiterTest {
    @Test
    void blocksTheSixthRequestForTheSameUser() {
        AiRateLimiter limiter = new AiRateLimiter(
                Clock.fixed(Instant.parse("2026-07-28T12:00:00Z"), ZoneOffset.UTC));

        for (int request = 0; request < 5; request++) {
            assertDoesNotThrow(() -> limiter.check("student@example.com"));
        }

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> limiter.check("student@example.com"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatusCode());
        assertDoesNotThrow(() -> limiter.check("another@example.com"));
    }
}
