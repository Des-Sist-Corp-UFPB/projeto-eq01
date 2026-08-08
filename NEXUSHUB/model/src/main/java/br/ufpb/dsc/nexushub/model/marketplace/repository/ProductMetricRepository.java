package br.ufpb.dsc.nexushub.model.marketplace.repository;

import br.ufpb.dsc.nexushub.model.marketplace.domain.ProductMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProductMetricRepository extends JpaRepository<ProductMetric, UUID> {
    Optional<ProductMetric> findByProductIdAndRecordStatus(UUID productId, Integer recordStatus);
}
