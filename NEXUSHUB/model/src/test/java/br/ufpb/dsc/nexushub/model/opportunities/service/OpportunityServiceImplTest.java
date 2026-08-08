package br.ufpb.dsc.nexushub.model.opportunities.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.administration.repository.ReportTicketRepository;
import br.ufpb.dsc.nexushub.model.dto.*;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.opportunities.domain.*;
import br.ufpb.dsc.nexushub.model.opportunities.repository.*;
import br.ufpb.dsc.nexushub.model.opportunities.service.impl.OpportunityServiceImpl;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import java.util.*;
import org.junit.jupiter.api.Test;

class OpportunityServiceImplTest {

    OpportunityRepository opportunities = mock(OpportunityRepository.class);
    OpportunityApplicationRepository applications = mock(OpportunityApplicationRepository.class);
    HumanRepository humans = mock(HumanRepository.class);
    GroupRepository groups = mock(GroupRepository.class);
    ProjectRepository projects = mock(ProjectRepository.class);
    OpportunityFormRepository forms = mock(OpportunityFormRepository.class);
    OpportunityQuestionRepository questions = mock(OpportunityQuestionRepository.class);
    OpportunityOptionRepository options = mock(OpportunityOptionRepository.class);
    OpportunityAnswerRepository answers = mock(OpportunityAnswerRepository.class);
    ReportTicketRepository tickets = mock(ReportTicketRepository.class);

    OpportunityServiceImpl service = new OpportunityServiceImpl(
            opportunities,
            applications,
            humans,
            groups,
            projects,
            forms,
            questions,
            options,
            answers,
            tickets
    );

    @Test
    void listsOnlyActive() {
        Opportunity active = mock(Opportunity.class);
        Opportunity inactive = mock(Opportunity.class);
        
        Human pub = mock(Human.class);
        when(pub.getUserType()).thenReturn("Professor");
        
        when(active.getRecordStatus()).thenReturn(1);
        when(active.getStatus()).thenReturn(1);
        when(active.getPublisher()).thenReturn(pub);
        
        when(inactive.getRecordStatus()).thenReturn(0);
        when(inactive.getStatus()).thenReturn(1);
        
        when(opportunities.findAll()).thenReturn(List.of(active, inactive));
        when(forms.findByOpportunityIdAndRecordStatus(any(), anyInt())).thenReturn(Optional.empty());

        List<OportunidadeResponse> res = service.listOpenOpportunities();
        assertEquals(1, res.size());
    }

    @Test
    void createsOpportunity() {
        UUID humanId = UUID.randomUUID();
        Human publisher = mock(Human.class);
        when(humans.findById(humanId)).thenReturn(Optional.of(publisher));
        when(opportunities.save(any())).thenAnswer(i -> i.getArgument(0));

        OportunidadeCadastroRequest req = new OportunidadeCadastroRequest(
                "Vaga Teste", "Desc", 1, null, null, 1, false, null, false, "123", null, null, null
        );

        assertNotNull(service.createOpportunity(humanId, req, humanId));
        
        assertThrows(IllegalArgumentException.class, () -> 
                service.createOpportunity(UUID.randomUUID(), req, humanId)
        );
    }

    @Test
    void appliesCandidacy() {
        UUID oppId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Opportunity opp = mock(Opportunity.class);
        when(opp.getRecordStatus()).thenReturn(1);
        
        Human human = mock(Human.class);
        
        when(opportunities.findById(oppId)).thenReturn(Optional.of(opp));
        when(humans.findById(humanId)).thenReturn(Optional.of(human));
        
        when(applications.findByOpportunityAndHuman(opp, human)).thenReturn(Optional.empty());
        when(applications.save(any())).thenAnswer(i -> i.getArgument(0));

        CandidaturaRequest req = new CandidaturaRequest("Mensagem", "8399999", null);
        assertNotNull(service.applyWithAnswers(oppId, humanId, req, humanId));
    }

    @Test
    void testGetOpportunityDetails() {
        UUID oppId = UUID.randomUUID();
        Opportunity opp = mock(Opportunity.class);
        when(opp.getRecordStatus()).thenReturn(1);
        when(opportunities.findById(oppId)).thenReturn(Optional.of(opp));
        when(forms.findByOpportunityIdAndRecordStatus(any(), anyInt())).thenReturn(Optional.empty());

        assertNotNull(service.getOpportunityDetails(oppId));

        when(opp.getRecordStatus()).thenReturn(0);
        assertThrows(IllegalArgumentException.class, () -> service.getOpportunityDetails(oppId));
    }

    @Test
    void testDeleteOpportunity() {
        UUID oppId = UUID.randomUUID();
        UUID humanId = UUID.randomUUID();
        Opportunity opp = mock(Opportunity.class);
        when(opp.getRecordStatus()).thenReturn(1);
        when(opportunities.findById(oppId)).thenReturn(Optional.of(opp));
        when(opportunities.save(any())).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> service.deleteOpportunity(oppId, humanId));
    }
}
