package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_feature")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FeatureFlag {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idfeature") private UUID id;
    @Column(name = "cdfeature", nullable = false) private String code;
    @Column(name = "flenabled", nullable = false) private boolean enabled;
    @Column(name = "dsfeature") private String description;
    @Column(name = "tsupdated", nullable = false) private LocalDateTime updatedAt = LocalDateTime.now();

    public FeatureFlag(String code, boolean enabled, String description) {
        this.code = code;
        this.enabled = enabled;
        this.description = description;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        this.updatedAt = LocalDateTime.now();
    }
}
