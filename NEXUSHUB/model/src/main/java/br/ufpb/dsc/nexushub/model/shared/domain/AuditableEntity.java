package br.ufpb.dsc.nexushub.model.shared.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;

@MappedSuperclass
@Getter
public abstract class AuditableEntity {

    @Column(name = "strecord", nullable = false)
    protected Integer recordStatus = 1;

    @Column(name = "idupdatedby", nullable = false)
    protected UUID updatedById;

    @Column(name = "tsupdated", nullable = false)
    protected LocalDateTime updatedAt = LocalDateTime.now();

    public void touch(UUID updatedById) {
        this.updatedById = updatedById;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate(UUID updatedById) {
        this.recordStatus = 0;
        touch(updatedById);
    }
}
