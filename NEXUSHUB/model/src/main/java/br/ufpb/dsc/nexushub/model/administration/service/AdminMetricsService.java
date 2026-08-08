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
    private final br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository projectRepository;

    private static final Set<String> RIO_TINTO_COURSES = Set.of(
        "Antropologia",
        "Ciência da Computação",
        "Design",
        "Ecologia",
        "Matemática",
        "Sistemas de Informação"
    );

    public AdminMetricsService(AuditLogRepository auditLogRepository, UserRepository userRepository,
                               br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository projectRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
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

    @Transactional(readOnly = true)
    public Map<String, Object> getCampiStats() {
        List<User> allUsers = userRepository.findAll();
        List<br.ufpb.dsc.nexushub.model.projects.domain.Project> allProjects = projectRepository.findAll();

        long rtStudents = 0;
        long mmpStudents = 0;

        for (User u : allUsers) {
            if (u.getHuman() != null) {
                String course = u.getHuman().getCourse();
                if (course != null && !course.isBlank()) {
                    if (RIO_TINTO_COURSES.contains(course)) {
                        rtStudents++;
                    } else {
                        mmpStudents++;
                    }
                }
            }
        }

        long rtProjects = 0;
        long mmpProjects = 0;

        for (br.ufpb.dsc.nexushub.model.projects.domain.Project p : allProjects) {
            if (p.getOwner() != null) {
                String course = p.getOwner().getCourse();
                if (course != null && !course.isBlank()) {
                    if (RIO_TINTO_COURSES.contains(course)) {
                        rtProjects++;
                    } else {
                        mmpProjects++;
                    }
                }
            }
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        
        Map<String, Object> rtStats = new LinkedHashMap<>();
        rtStats.put("projects", rtProjects);
        rtStats.put("students", rtStudents);

        Map<String, Object> mmpStats = new LinkedHashMap<>();
        mmpStats.put("projects", mmpProjects);
        mmpStats.put("students", mmpStudents);

        stats.put("rioTinto", rtStats);
        stats.put("mamanguape", mmpStats);

        return stats;
    }
}
