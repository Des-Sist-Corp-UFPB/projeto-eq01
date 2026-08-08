package br.ufpb.dsc.nexushub.model.payments.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
@Entity @Table(name="pay_order") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class PaymentOrder {
 @Id @Column(name="idorder") private UUID id;
 @Column(name="iduser",nullable=false) private UUID userId;
 @ManyToOne @JoinColumn(name="idproduct",nullable=false) private Product product;
 @Column(name="vlamount",nullable=false) private BigDecimal amount;
 @Column(name="storder",nullable=false) private String status;
 @Column(name="cdprovider",nullable=false) private String provider;
 @Column(name="idprovider") private String providerId;
 @Column(name="cdidempotency",nullable=false) private String idempotencyKey;
 @Column(name="urlcheckout") private String checkoutUrl;
 @Column(name="tscreated",nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 @Column(name="tsupdated",nullable=false) private LocalDateTime updatedAt=LocalDateTime.now();
 public PaymentOrder(UUID userId,Product product,String idempotencyKey){
  if(userId==null||product==null||!product.isActive())throw new IllegalArgumentException("Produto indisponivel.");
  this.id=UUID.randomUUID();this.userId=userId;this.product=product;this.amount=product.getPrice();this.status="CREATED";this.provider="MERCADO_PAGO";this.idempotencyKey=idempotencyKey;
 }
 public void awaiting(String providerId,String url){this.providerId=providerId;this.checkoutUrl=url;this.status="PENDING";touch();}
 public void paid(){this.status="PAID";touch();}
 public void failed(){this.status="FAILED";touch();}
 private void touch(){updatedAt=LocalDateTime.now();}
}
