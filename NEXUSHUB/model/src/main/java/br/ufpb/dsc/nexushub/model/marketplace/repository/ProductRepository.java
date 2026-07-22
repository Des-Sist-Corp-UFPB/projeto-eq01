package br.ufpb.dsc.nexushub.model.marketplace.repository;

import br.ufpb.dsc.nexushub.model.marketplace.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository("marketplaceProductRepository")
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findAllByRecordStatusOrderByUpdatedAtDesc(Integer recordStatus);
    List<Product> findAllBySellerIdAndRecordStatusOrderByUpdatedAtDesc(UUID sellerId, Integer recordStatus);
    List<Product> findAllByShopIdAndRecordStatusOrderByUpdatedAtDesc(UUID shopId, Integer recordStatus);
}
