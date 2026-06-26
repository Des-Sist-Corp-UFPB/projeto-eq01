package br.ufpb.dsc.nexushub.model.opportunities.service;

import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import java.util.List;
import java.util.UUID;

public interface OpportunityService {

    List<Opportunity> listOpenOpportunities();

    Opportunity createOpportunity(UUID publisherHumanId, UUID groupId, UUID projectId, String name, String description, Integer type, UUID updatedById);

    OpportunityApplication apply(UUID opportunityId, UUID humanId, String message, UUID updatedById);
}
