package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_xp_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class XpRule {
    @Id
    @Column(name = "idrule")
    private UUID id = UUID.randomUUID();

    @Column(name = "cdaction_key", nullable = false, unique = true)
    private String actionKey;

    @Column(name = "nixp_value", nullable = false)
    private int xpValue;
}
