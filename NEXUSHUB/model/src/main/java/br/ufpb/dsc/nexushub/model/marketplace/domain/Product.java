package br.ufpb.dsc.nexushub.model.marketplace.domain;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.UUID;

@Entity(name = "MarketplaceProduct")
@Table(name = "mkt_product")
@Data
@EqualsAndHashCode(callSuper = true)
public class Product extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "idproduct")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idshop")
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idseller", nullable = false)
    private Human seller;

    @Column(name = "dstitle", nullable = false, length = 150)
    private String title;

    @Column(name = "dsdescription", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dscategory", nullable = false, length = 50)
    private String category = "Outros";

    @Column(name = "numprice", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "numstock", nullable = false)
    private Integer stock = 1;

    @Column(name = "dsphotos", columnDefinition = "TEXT")
    private String photos;

    @Column(name = "dspaymentmethods", nullable = false, length = 255)
    private String paymentMethods;

    @Column(name = "dspixkey", length = 100)
    private String pixKey;

    @Column(name = "dsmeetlocations", columnDefinition = "TEXT")
    private String meetLocations;

    @Column(name = "dscampus", nullable = false, length = 50)
    private String campus;

    @Column(name = "flactive", nullable = false)
    private boolean active = true;

    public void update(Shop shop, String title, String description, String category, BigDecimal price, Integer stock, 
                       String photos, String paymentMethods, String pixKey, String meetLocations, 
                       String campus, boolean active, UUID updatedById) {
        this.shop = shop;
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.photos = photos;
        this.paymentMethods = paymentMethods;
        this.pixKey = pixKey;
        this.meetLocations = meetLocations;
        this.campus = campus;
        this.active = active;
        touch(updatedById);
    }
}
