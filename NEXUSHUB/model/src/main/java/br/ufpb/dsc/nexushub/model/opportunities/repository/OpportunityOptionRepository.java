package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityOption;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpportunityOptionRepository extends JpaRepository<OpportunityOption, UUID> {
    List<OpportunityOption> findByQuestionIdAndRecordStatusOrderBySortOrderAsc(UUID questionId, Integer recordStatus);
}
