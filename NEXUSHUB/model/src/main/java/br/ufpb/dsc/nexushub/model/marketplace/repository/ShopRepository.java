package br.ufpb.dsc.nexushub.model.marketplace.repository;

import br.ufpb.dsc.nexushub.model.marketplace.domain.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ShopRepository extends JpaRepository<Shop, UUID> {
    Optional<Shop> findByOwnerIdAndRecordStatus(UUID ownerId, Integer recordStatus);
}
