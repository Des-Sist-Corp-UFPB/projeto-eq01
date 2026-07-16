package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.marketplace.domain.Shop;
import java.util.UUID;

public record ShopResponse(
        UUID id,
        UUID ownerId,
        String name,
        String description,
        String logo,
        String banner,
        String meetLocations,
        String campus,
        boolean active
) {
    public static ShopResponse from(Shop shop) {
        if (shop == null) return null;
        return new ShopResponse(
                shop.getId(),
                shop.getOwner().getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getLogo(),
                shop.getBanner(),
                shop.getMeetLocations(),
                shop.getCampus(),
                shop.isActive()
        );
    }
}
