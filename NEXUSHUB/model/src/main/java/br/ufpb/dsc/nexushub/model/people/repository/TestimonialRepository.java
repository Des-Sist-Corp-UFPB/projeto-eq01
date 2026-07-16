package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Testimonial;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestimonialRepository extends JpaRepository<Testimonial, UUID> {
    List<Testimonial> findAllByReceiverIdAndAcceptedAndRecordStatusOrderByUpdatedAtDesc(UUID receiverId, boolean accepted, Integer recordStatus);
}
