package br.ufpb.dsc.nexushub.model.administration.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "adm_banned_word")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BannedWord {
    @Id
    @Column(name = "idword")
    private UUID id = UUID.randomUUID();

    @Column(name = "nmword", nullable = false, unique = true)
    private String word;

    @Column(name = "tscreated", nullable = false)
    private LocalDateTime createdTime = LocalDateTime.now();
}
