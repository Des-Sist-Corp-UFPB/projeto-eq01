package br.ufpb.dsc.nexushub.model.payments.repository;
import br.ufpb.dsc.nexushub.model.payments.domain.PaymentWebhook;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook,UUID>{boolean existsByProviderAndEventId(String provider,String eventId);}
