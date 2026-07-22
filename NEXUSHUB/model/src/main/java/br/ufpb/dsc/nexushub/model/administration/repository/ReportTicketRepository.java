package br.ufpb.dsc.nexushub.model.administration.repository;

import br.ufpb.dsc.nexushub.model.administration.domain.ReportTicket;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportTicketRepository extends JpaRepository<ReportTicket, UUID> {
    List<ReportTicket> findAllByStatusOrderByCreatedTimeDesc(String status);
}
