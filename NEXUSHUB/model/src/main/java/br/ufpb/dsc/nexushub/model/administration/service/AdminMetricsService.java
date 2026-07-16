package br.ufpb.dsc.nexushub.model.administration.service;

import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import br.ufpb.dsc.nexushub.model.administration.repository.AuditLogRepository;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminMetricsService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AdminMetricsService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEngagementStats() {
        LocalDateTime dayAgo = LocalDateTime.now().minusDays(1);
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);

        List<AuditLog> dayLogs = auditLogRepository.findAll().stream()
                .filter(log -> "LOGIN".equals(log.getAction()) && log.getCreatedAt().isAfter(dayAgo))
                .toList();

        List<AuditLog> monthLogs = auditLogRepository.findAll().stream()
                .filter(log -> "LOGIN".equals(log.getAction()) && log.getCreatedAt().isAfter(monthAgo))
                .toList();

        long dau = dayLogs.stream().map(AuditLog::getActorId).distinct().count();
        long mau = monthLogs.stream().map(AuditLog::getActorId).distinct().count();

        double ratio = mau > 0 ? (double) dau / mau : 0.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("dau", dau);
        stats.put("mau", mau);
        stats.put("ratio", ratio);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRetentionStats() {
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        List<User> newUsers = userRepository.findAll(); // simplified for local query

        long totalNew = newUsers.size();
        long completedOnboarding = newUsers.stream()
                .filter(User::isOnboardingCompleted)
                .count();

        double retentionRate = totalNew > 0 ? (double) completedOnboarding / totalNew * 100.0 : 0.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRegistered", totalNew);
        stats.put("onboardingCompleted", completedOnboarding);
        stats.put("retentionRate", retentionRate);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getEngagementByCourse() {
        Map<String, Long> courseStats = new LinkedHashMap<>();
        List<User> all = userRepository.findAll();
        for (User u : all) {
            String course = u.getHuman().getCourse();
            if (course == null || course.isBlank()) {
                course = "Litoral Norte (Comum)";
            }
            courseStats.put(course, courseStats.getOrDefault(course, 0L) + 1L);
        }
        return courseStats;
    }
}
