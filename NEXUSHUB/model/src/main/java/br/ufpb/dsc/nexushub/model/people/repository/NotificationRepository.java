package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findAllByReceiverIdAndReadOrderByCreatedTimeDesc(UUID receiverId, boolean read);
    List<Notification> findAllByReceiverIdOrderByCreatedTimeDesc(UUID receiverId);
}
