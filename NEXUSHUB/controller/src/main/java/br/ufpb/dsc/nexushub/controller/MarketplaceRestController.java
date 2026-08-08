package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.*;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.marketplace.service.MarketplaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceRestController {

    private final MarketplaceService marketplaceService;
    private final IdentityService identityService;

    public MarketplaceRestController(MarketplaceService marketplaceService, IdentityService identityService) {
        this.marketplaceService = marketplaceService;
        this.identityService = identityService;
    }

    @GetMapping("/produtos")
    public ResponseEntity<List<ProductResponse>> getActiveProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(marketplaceService.getActiveProducts(search, campus, category));
    }

    @GetMapping("/produtos/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id, Principal principal) {
        UUID userId = getUserId(principal);
        marketplaceService.recordProductView(id, userId);
        return ResponseEntity.ok(marketplaceService.getProductById(id));
    }

    @PostMapping("/produtos/{id}/click")
    public ResponseEntity<?> recordProductClick(@PathVariable UUID id, Principal principal) {
        UUID userId = getUserId(principal);
        marketplaceService.recordProductClick(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/produtos")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        UUID sellerId = user.getHuman().getId();
        ProductResponse response = marketplaceService.createProduct(sellerId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        UUID sellerId = user.getHuman().getId();
        ProductResponse response = marketplaceService.updateProduct(sellerId, id, request, user.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable UUID id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        UUID sellerId = user.getHuman().getId();
        marketplaceService.deleteProduct(sellerId, id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/loja")
    public ResponseEntity<ShopResponse> getShop(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        ShopResponse shop = marketplaceService.getShopByOwner(user.getHuman().getId());
        return ResponseEntity.ok(shop);
    }

    @PostMapping("/loja")
    public ResponseEntity<?> createOrUpdateShop(@Valid @RequestBody ShopRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        ShopResponse response = marketplaceService.createOrUpdateShop(user.getHuman().getId(), request, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/loja/dashboard")
    public ResponseEntity<List<ProductResponse>> getMyStoreProducts(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = identityService.findByEmail(principal.getName());
        List<ProductResponse> products = marketplaceService.getProductsBySeller(user.getHuman().getId());
        return ResponseEntity.ok(products);
    }

    private UUID getUserId(Principal principal) {
        if (principal == null) {
            return UUID.randomUUID();
        }
        User user = identityService.findByEmail(principal.getName());
        return user.getId();
    }
}
