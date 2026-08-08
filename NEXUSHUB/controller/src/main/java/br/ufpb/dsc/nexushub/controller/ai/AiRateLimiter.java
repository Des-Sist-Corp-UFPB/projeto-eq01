package br.ufpb.dsc.nexushub.controller.ai;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
class AiRateLimiter {
    private static final int MAX_REQUESTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(10);

    private final Map<String, ArrayDeque<Instant>> requests = new ConcurrentHashMap<>();
    private final Clock clock;

    AiRateLimiter() {
        this(Clock.systemUTC());
    }

    AiRateLimiter(Clock clock) {
        this.clock = clock;
    }

    void check(String userId) {
        var now = clock.instant();
        var cutoff = now.minus(WINDOW);
        var userRequests = requests.computeIfAbsent(userId, ignored -> new ArrayDeque<>());
        synchronized (userRequests) {
            while (!userRequests.isEmpty() && userRequests.peekFirst().isBefore(cutoff)) {
                userRequests.removeFirst();
            }
            if (userRequests.size() >= MAX_REQUESTS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Limite de sugestoes atingido. Tente novamente em alguns minutos.");
            }
            userRequests.addLast(now);
        }
    }
}
