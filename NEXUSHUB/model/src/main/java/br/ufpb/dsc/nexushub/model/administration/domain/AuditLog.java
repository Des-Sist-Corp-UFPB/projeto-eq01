package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_audit")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idaudit") private UUID id;
    @Column(name = "idactor") private UUID actorId;
    @Column(name = "cdaction", nullable = false) private String action;
    @Column(name = "nmentity", nullable = false) private String entity;
    @Column(name = "identity") private String entityId;
    @Column(name = "dsresult", nullable = false) private String result;
    @Column(name = "dsip") private String ip;
    @Column(name = "cdcorrelation") private String correlationId;
    @Column(name = "dsbefore") private String beforeValue;
    @Column(name = "dsafter") private String afterValue;
    @Column(name = "tscreated", nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public AuditLog(UUID actorId, String action, String entity, String entityId, String result,
                    String ip, String correlationId, String beforeValue, String afterValue) {
        this.actorId = actorId;
        this.action = required(action, "action");
        this.entity = required(entity, "entity");
        this.entityId = entityId;
        this.result = required(result, "result");
        this.ip = trim(ip, 64);
        this.correlationId = trim(correlationId, 80);
        this.beforeValue = sanitize(beforeValue);
        this.afterValue = sanitize(afterValue);
    }

    private static String required(String value, String field) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(field + " obrigatorio");
        return value.trim();
    }
    private static String trim(String value, int size) {
        return value == null ? null : value.substring(0, Math.min(value.length(), size));
    }
    static String sanitize(String value) {
        if (value == null) return null;
        return value.replaceAll("(?i)(password|senha|token|authorization)\\s*[:=]\\s*[^,;}\\s]+", "$1=[REDACTED]");
    }
}
