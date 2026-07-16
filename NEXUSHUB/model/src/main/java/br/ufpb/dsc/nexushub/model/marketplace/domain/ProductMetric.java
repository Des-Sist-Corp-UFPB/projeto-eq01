package br.ufpb.dsc.nexushub.model.marketplace.domain;

import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "mkt_product_metric")
@Data
@EqualsAndHashCode(callSuper = true)
public class ProductMetric extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "idmetric")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproduct", nullable = false)
    private Product product;

    @Column(name = "numviews", nullable = false)
    private Integer views = 0;

    @Column(name = "numclicks", nullable = false)
    private Integer clicks = 0;

    public void incrementViews() {
        this.views++;
    }

    public void incrementClicks() {
        this.clicks++;
    }
}
