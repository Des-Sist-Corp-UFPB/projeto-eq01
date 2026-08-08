package br.ufpb.dsc.nexushub.model.privacy.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="lgp_consent") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class Consent {
 @Id @GeneratedValue(strategy=GenerationType.UUID) @Column(name="idconsent") private UUID id;
 @Column(name="iduser",nullable=false) private UUID userId;
 @Column(name="cdpurpose",nullable=false) private String purpose;
 @Column(name="cdversion",nullable=false) private String version;
 @Column(name="flgranted",nullable=false) private boolean granted;
 @Column(name="tscreated",nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public Consent(UUID userId,String purpose,String version,boolean granted){
  if(userId==null||purpose==null||purpose.isBlank()||version==null||version.isBlank()) throw new IllegalArgumentException("Consentimento invalido.");
  this.userId=userId;this.purpose=purpose.trim();this.version=version.trim();this.granted=granted;
 }
}
