package br.ufpb.dsc.nexushub.model.payments.repository;
import br.ufpb.dsc.nexushub.model.payments.domain.PaymentOrder;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder,UUID>{
 Optional<PaymentOrder> findByIdempotencyKey(String key);
 List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
