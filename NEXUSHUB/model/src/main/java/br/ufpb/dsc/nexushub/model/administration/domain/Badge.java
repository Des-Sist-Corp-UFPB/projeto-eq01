package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_badge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Badge {
    @Id
    @Column(name = "idbadge")
    private UUID id = UUID.randomUUID();

    @Column(name = "nmname", nullable = false)
    private String name;

    @Column(name = "dsdescription", nullable = false)
    private String description;

    @Column(name = "dsicon_url")
    private String iconUrl;

    @Column(name = "nminput_rule")
    private String inputRule;

    @Column(name = "nixp_bonus", nullable = false)
    private int xpBonus;

    @Column(name = "tscreated", nullable = false)
    private LocalDateTime createdTime = LocalDateTime.now();
}
