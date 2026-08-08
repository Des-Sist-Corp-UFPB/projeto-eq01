package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_report_ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportTicket {
    @Id
    @Column(name = "idticket")
    private UUID id = UUID.randomUUID();

    @Column(name = "cdtarget_type", nullable = false)
    private String targetType; // POST, USER, COMMENT, GROUP, EVENT

    @Column(name = "idtarget", nullable = false)
    private UUID targetId;

    @Column(name = "dsreason", nullable = false)
    private String reason;

    @Column(name = "dsstatus", nullable = false)
    private String status = "PENDING"; // PENDING, ARCHIVED, RESOLVED

    @Column(name = "tscreated", nullable = false)
    private LocalDateTime createdTime = LocalDateTime.now();

    @Column(name = "idmoderator")
    private UUID moderatorId;
}
