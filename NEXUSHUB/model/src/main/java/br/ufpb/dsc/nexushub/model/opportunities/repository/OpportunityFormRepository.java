package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityForm;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpportunityFormRepository extends JpaRepository<OpportunityForm, UUID> {
    Optional<OpportunityForm> findByOpportunityIdAndRecordStatus(UUID opportunityId, Integer recordStatus);
}
