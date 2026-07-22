package br.ufpb.dsc.nexushub.model.privacy.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="lgp_request") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class DataSubjectRequest {
 @Id @GeneratedValue(strategy=GenerationType.UUID) @Column(name="idrequest") private UUID id;
 @Column(name="iduser",nullable=false) private UUID userId;
 @Column(name="tprequest",nullable=false) private String type;
 @Column(name="strequest",nullable=false) private String status="OPEN";
 @Column(name="tscreated",nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 @Column(name="tscompleted") private LocalDateTime completedAt;
 public DataSubjectRequest(UUID userId,String type){
  if(!"EXPORT".equals(type)&&!"ANONYMIZE".equals(type)) throw new IllegalArgumentException("Tipo LGPD invalido.");
  this.userId=userId;this.type=type;
 }
 public void complete(){status="COMPLETED";completedAt=LocalDateTime.now();}
}
