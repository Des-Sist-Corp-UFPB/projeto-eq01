package br.ufpb.dsc.nexushub.model.marketplace.service.impl;

import br.ufpb.dsc.nexushub.model.dto.*;
import br.ufpb.dsc.nexushub.model.marketplace.domain.Product;
import br.ufpb.dsc.nexushub.model.marketplace.domain.ProductMetric;
import br.ufpb.dsc.nexushub.model.marketplace.domain.Shop;
import br.ufpb.dsc.nexushub.model.marketplace.repository.ProductMetricRepository;
import br.ufpb.dsc.nexushub.model.marketplace.repository.ProductRepository;
import br.ufpb.dsc.nexushub.model.marketplace.repository.ShopRepository;
import br.ufpb.dsc.nexushub.model.marketplace.service.MarketplaceService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final ProductMetricRepository productMetricRepository;
    private final HumanRepository humanRepository;

    public MarketplaceServiceImpl(ShopRepository shopRepository,
                                  ProductRepository productRepository,
                                  ProductMetricRepository productMetricRepository,
                                  HumanRepository humanRepository) {
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
        this.productMetricRepository = productMetricRepository;
        this.humanRepository = humanRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ShopResponse getShopByOwner(UUID ownerId) {
        return shopRepository.findByOwnerIdAndRecordStatus(ownerId, 1)
                .map(ShopResponse::from)
                .orElse(null);
    }

    @Override
    @Transactional
    public ShopResponse createOrUpdateShop(UUID ownerId, ShopRequest request, UUID userId) {
        Human owner = humanRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor nao encontrado."));

        Optional<Shop> existing = shopRepository.findByOwnerIdAndRecordStatus(ownerId, 1);
        Shop shop;
        if (existing.isPresent()) {
            shop = existing.get();
            shop.update(request.name(), request.description(), request.logo(), request.campus(), request.active(), userId);
        } else {
            shop = new Shop();
            shop.setOwner(owner);
            shop.update(request.name(), request.description(), request.logo(), request.campus(), request.active(), userId);
        }
        return ShopResponse.from(shopRepository.save(shop));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts(String search, String campus, String category) {
        List<Product> products = productRepository.findAllByRecordStatusOrderByUpdatedAtDesc(1);

        return products.stream()
                .filter(p -> p.isActive() && (p.getShop() == null || p.getShop().isActive()))
                .filter(p -> campus == null || campus.isBlank() || p.getCampus().equalsIgnoreCase(campus.trim()))
                .filter(p -> category == null || category.isBlank() || p.getCategory().equalsIgnoreCase(category.trim()))
                .filter(p -> search == null || search.isBlank() || 
                        p.getTitle().toLowerCase().contains(search.toLowerCase().trim()) || 
                        (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase().trim())))
                .map(p -> {
                    ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(p.getId(), 1).orElse(null);
                    return ProductResponse.from(p, metric);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Anuncio nao encontrado."));
        if (product.getRecordStatus() == 0) {
            throw new IllegalArgumentException("Anuncio inativo.");
        }
        return ProductResponse.from(product, productMetricRepository.findByProductIdAndRecordStatus(productId, 1).orElse(null));
    }

    @Override
    @Transactional
    public ProductResponse createProduct(UUID sellerId, ProductRequest request, UUID userId) {
        Human seller = humanRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor nao encontrado."));

        Shop shop = null;
        if (request.shopId() != null) {
            shop = shopRepository.findById(request.shopId())
                    .orElseThrow(() -> new IllegalArgumentException("Loja nao encontrada."));
            if (!shop.getOwner().getId().equals(sellerId)) {
                throw new IllegalArgumentException("Esta loja nao pertence a voce.");
            }
        }

        Product product = new Product();
        product.setSeller(seller);
        product.update(shop, request.title(), request.description(), request.category(), request.price(), 
                       request.stock(), request.photos(), request.paymentMethods(), request.pixKey(), 
                       request.meetLocations(), request.campus(), request.active(), userId);

        Product saved = productRepository.save(product);

        ProductMetric metric = new ProductMetric();
        metric.setProduct(saved);
        metric.touch(userId);
        productMetricRepository.save(metric);

        return ProductResponse.from(saved, metric);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID sellerId, UUID productId, ProductRequest request, UUID userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Anuncio nao encontrado."));
        
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Este anuncio nao pertence a voce.");
        }

        Shop shop = null;
        if (request.shopId() != null) {
            shop = shopRepository.findById(request.shopId())
                    .orElseThrow(() -> new IllegalArgumentException("Loja nao encontrada."));
            if (!shop.getOwner().getId().equals(sellerId)) {
                throw new IllegalArgumentException("Esta loja nao pertence a voce.");
            }
        }

        product.update(shop, request.title(), request.description(), request.category(), request.price(), 
                       request.stock(), request.photos(), request.paymentMethods(), request.pixKey(), 
                       request.meetLocations(), request.campus(), request.active(), userId);

        Product saved = productRepository.save(product);
        ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(productId, 1).orElse(null);

        return ProductResponse.from(saved, metric);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID sellerId, UUID productId, UUID userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Anuncio nao encontrado."));
        
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Este anuncio nao pertence a voce.");
        }

        product.deactivate(userId);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void recordProductView(UUID productId, UUID userId) {
        ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(productId, 1)
                .orElseGet(() -> {
                    Product p = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Anuncio nao encontrado."));
                    ProductMetric pm = new ProductMetric();
                    pm.setProduct(p);
                    return pm;
                });
        metric.incrementViews();
        metric.touch(userId);
        productMetricRepository.save(metric);
    }

    @Override
    @Transactional
    public void recordProductClick(UUID productId, UUID userId) {
        ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(productId, 1)
                .orElseGet(() -> {
                    Product p = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Anuncio nao encontrado."));
                    ProductMetric pm = new ProductMetric();
                    pm.setProduct(p);
                    return pm;
                });
        metric.incrementClicks();
        metric.touch(userId);
        productMetricRepository.save(metric);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySeller(UUID sellerId) {
        return productRepository.findAllBySellerIdAndRecordStatusOrderByUpdatedAtDesc(sellerId, 1)
                .stream()
                .map(p -> {
                    ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(p.getId(), 1).orElse(null);
                    return ProductResponse.from(p, metric);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByShop(UUID shopId) {
        return productRepository.findAllByShopIdAndRecordStatusOrderByUpdatedAtDesc(shopId, 1)
                .stream()
                .map(p -> {
                    ProductMetric metric = productMetricRepository.findByProductIdAndRecordStatus(p.getId(), 1).orElse(null);
                    return ProductResponse.from(p, metric);
                })
                .collect(Collectors.toList());
    }
}
