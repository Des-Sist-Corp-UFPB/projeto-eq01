package br.ufpb.dsc.nexushub.model.marketplace.service;

import br.ufpb.dsc.nexushub.model.dto.*;
import java.util.List;
import java.util.UUID;

public interface MarketplaceService {

    ShopResponse getShopByOwner(UUID ownerId);

    ShopResponse createOrUpdateShop(UUID ownerId, ShopRequest request, UUID userId);

    List<ProductResponse> getActiveProducts(String search, String campus, String category);

    ProductResponse getProductById(UUID productId);

    ProductResponse createProduct(UUID sellerId, ProductRequest request, UUID userId);

    ProductResponse updateProduct(UUID sellerId, UUID productId, ProductRequest request, UUID userId);

    void deleteProduct(UUID sellerId, UUID productId, UUID userId);

    void recordProductView(UUID productId, UUID userId);

    void recordProductClick(UUID productId, UUID userId);

    List<ProductResponse> getProductsBySeller(UUID sellerId);

    List<ProductResponse> getProductsByShop(UUID shopId);
}
