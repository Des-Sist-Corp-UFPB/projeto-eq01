package br.ufpb.dsc.nexushub.model.administration.service;

import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import br.ufpb.dsc.nexushub.model.administration.repository.AuditLogRepository;
import br.ufpb.dsc.nexushub.model.privacy.domain.DataSubjectRequest;
import br.ufpb.dsc.nexushub.model.privacy.repository.DataSubjectRequestRepository;
import br.ufpb.dsc.nexushub.model.privacy.service.PrivacyService;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminSecurityService {
    private final AuditLogRepository auditLogRepository;
    private final DataSubjectRequestRepository dataSubjectRequestRepository;
    private final PrivacyService privacyService;

    public AdminSecurityService(AuditLogRepository auditLogRepository,
                                DataSubjectRequestRepository dataSubjectRequestRepository,
                                PrivacyService privacyService) {
        this.auditLogRepository = auditLogRepository;
        this.dataSubjectRequestRepository = dataSubjectRequestRepository;
        this.privacyService = privacyService;
    }

    @Transactional(readOnly = true)
    public List<AuditLog> queryLogs(UUID actorId, String action, String ip) {
        return auditLogRepository.findAll().stream()
                .filter(log -> {
                    if (actorId != null && !actorId.equals(log.getActorId())) return false;
                    if (action != null && !action.equalsIgnoreCase(log.getAction())) return false;
                    if (ip != null && !ip.equals(log.getIp())) return false;
                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DataSubjectRequest> listLgpdRequests() {
        return dataSubjectRequestRepository.findAll();
    }

    @Transactional
    public void processLgpdRequest(UUID id) {
        DataSubjectRequest request = dataSubjectRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requisição LGPD não encontrada."));
        request.complete();
        dataSubjectRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<String> detectSecurityAlerts() {
        List<String> alerts = new ArrayList<>();
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);

        List<AuditLog> recentFailures = auditLogRepository.findAll().stream()
                .filter(log -> "LOGIN_FAILED".equals(log.getAction()) && log.getCreatedAt().isAfter(tenMinutesAgo))
                .toList();

        Map<String, Integer> ipFailureCount = new HashMap<>();
        for (AuditLog log : recentFailures) {
            String ip = log.getIp();
            if (ip != null && !ip.isBlank()) {
                ipFailureCount.put(ip, ipFailureCount.getOrDefault(ip, 0) + 1);
            }
        }

        for (Map.Entry<String, Integer> entry : ipFailureCount.entrySet()) {
            if (entry.getValue() >= 5) {
                alerts.add("ALERTA: O IP " + entry.getKey() + " registrou " + entry.getValue() + " tentativas de login falhas nos últimos 10 minutos (Possível ataque de força bruta).");
            }
        }

        return alerts;
    }
}
