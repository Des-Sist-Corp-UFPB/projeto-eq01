package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.marketplace.domain.Product;
import br.ufpb.dsc.nexushub.model.marketplace.domain.ProductMetric;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        UUID shopId,
        String shopName,
        UUID sellerId,
        String sellerName,
        String sellerPhone,
        String title,
        String description,
        String category,
        BigDecimal price,
        Integer stock,
        String photos,
        String paymentMethods,
        String pixKey,
        String meetLocations,
        String campus,
        boolean active,
        int views,
        int clicks,
        LocalDateTime tsupdated
) {
    public static ProductResponse from(Product product, ProductMetric metric) {
        if (product == null) return null;
        UUID shopId = product.getShop() != null ? product.getShop().getId() : null;
        String shopName = product.getShop() != null ? product.getShop().getName() : null;
        int views = metric != null ? metric.getViews() : 0;
        int clicks = metric != null ? metric.getClicks() : 0;
        return new ProductResponse(
                product.getId(),
                shopId,
                shopName,
                product.getSeller().getId(),
                product.getSeller().getName(),
                product.getSeller().getWhatsapp(),
                product.getTitle(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getPhotos(),
                product.getPaymentMethods(),
                product.getPixKey(),
                product.getMeetLocations(),
                product.getCampus(),
                product.isActive(),
                views,
                clicks,
                product.getUpdatedAt()
        );
    }
}
