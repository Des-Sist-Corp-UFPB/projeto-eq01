package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpportunityAnswerRepository extends JpaRepository<OpportunityAnswer, UUID> {
    List<OpportunityAnswer> findByApplicationIdAndRecordStatus(UUID applicationId, Integer recordStatus);
}
