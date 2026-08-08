package br.ufpb.dsc.nexushub.model.administration.service;
import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import br.ufpb.dsc.nexushub.model.administration.repository.AuditLogRepository;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AuditService {
    private final AuditLogRepository repository;
    public AuditService(AuditLogRepository repository) { this.repository = repository; }
    @Transactional
    public AuditLog record(UUID actor, String action, String entity, String entityId, String result,
                           String ip, String correlation, String before, String after) {
        return repository.save(new AuditLog(actor, action, entity, entityId, result, ip, correlation, before, after));
    }
    @Transactional(readOnly = true)
    public Page<AuditLog> list(String action, Pageable pageable) {
        return action == null || action.isBlank() ? repository.findAll(pageable)
                : repository.findByActionContainingIgnoreCase(action, pageable);
    }
}
