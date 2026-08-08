package br.ufpb.dsc.nexushub.model.payments.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
@Entity(name="PaymentProduct") @Table(name="pay_product") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.UUID) @Column(name="idproduct") private UUID id;
 @Column(name="nmproduct",nullable=false) private String name;
 @Column(name="dsproduct") private String description;
 @Column(name="vlprice",nullable=false) private BigDecimal price;
 @Column(name="flactive",nullable=false) private boolean active=true;
}
