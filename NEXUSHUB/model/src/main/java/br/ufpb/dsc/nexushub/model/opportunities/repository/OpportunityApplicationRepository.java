package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpportunityApplicationRepository extends JpaRepository<OpportunityApplication, UUID> {

    List<OpportunityApplication> findByOpportunity(Opportunity opportunity);

    Optional<OpportunityApplication> findByOpportunityAndHuman(Opportunity opportunity, Human human);
}
