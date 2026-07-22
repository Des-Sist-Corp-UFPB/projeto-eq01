package br.ufpb.dsc.nexushub.model.administration.repository;
import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByActionContainingIgnoreCase(String action, Pageable pageable);
}
