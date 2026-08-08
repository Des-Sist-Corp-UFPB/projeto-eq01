package br.ufpb.dsc.nexushub.model.opportunities.repository;

import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {

    List<Opportunity> findByPublisher(Human publisher);
}
