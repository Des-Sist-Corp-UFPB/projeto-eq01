package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityQuestion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpportunityQuestionRepository extends JpaRepository<OpportunityQuestion, UUID> {
    List<OpportunityQuestion> findByFormIdAndRecordStatusOrderBySortOrderAsc(UUID formId, Integer recordStatus);
}
