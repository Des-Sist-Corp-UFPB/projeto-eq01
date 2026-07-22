package br.ufpb.dsc.nexushub.model.payments.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="pay_webhook") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class PaymentWebhook {
 @Id @GeneratedValue(strategy=GenerationType.UUID) @Column(name="idwebhook") private UUID id;
 @Column(name="cdprovider",nullable=false) private String provider;
 @Column(name="idevent",nullable=false) private String eventId;
 @Column(name="idorder") private UUID orderId;
 @Column(name="dsevent") private String payload;
 @Column(name="tsprocessed",nullable=false) private LocalDateTime processedAt=LocalDateTime.now();
 public PaymentWebhook(String provider,String eventId,UUID orderId,String payload){this.provider=provider;this.eventId=eventId;this.orderId=orderId;this.payload=payload;}
}
