package br.ufpb.dsc.nexushub.model.opportunities.service;

import br.ufpb.dsc.nexushub.model.dto.CandidaturaRequest;
import br.ufpb.dsc.nexushub.model.dto.OportunidadeCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.OportunidadeDashboardResponse;
import br.ufpb.dsc.nexushub.model.dto.OportunidadeResponse;
import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import java.util.List;
import java.util.UUID;

public interface OpportunityService {

    List<OportunidadeResponse> listOpenOpportunities();

    OportunidadeResponse getOpportunityDetails(UUID id);

    Opportunity createOpportunity(UUID publisherHumanId, OportunidadeCadastroRequest request, UUID updatedById);

    Opportunity updateOpportunity(UUID id, OportunidadeCadastroRequest request, UUID updatedById);

    void deleteOpportunity(UUID id, UUID updatedById);

    void reportOpportunity(UUID id, String reason, UUID reporterId);

    OpportunityApplication applyWithAnswers(UUID opportunityId, UUID humanId, CandidaturaRequest request, UUID updatedById);

    List<OportunidadeDashboardResponse> listCreatorDashboard(UUID publisherHumanId);
}
