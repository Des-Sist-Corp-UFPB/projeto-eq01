package br.ufpb.dsc.nexushub.model.opportunities.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.dto.CandidaturaRequest;
import br.ufpb.dsc.nexushub.model.dto.OportunidadeCadastroRequest;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import br.ufpb.dsc.nexushub.model.opportunities.repository.*;
import br.ufpb.dsc.nexushub.model.opportunities.service.impl.OpportunityServiceImpl;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import br.ufpb.dsc.nexushub.model.administration.repository.ReportTicketRepository;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos de Oportunidades e Editais (OpportunityService)")
public class OpportunityServiceMetodosTest {

    private OpportunityRepository opportunityRepository = mock(OpportunityRepository.class);
    private OpportunityApplicationRepository applicationRepository = mock(OpportunityApplicationRepository.class);
    private HumanRepository humanRepository = mock(HumanRepository.class);
    private GroupRepository groupRepository = mock(GroupRepository.class);
    private ProjectRepository projectRepository = mock(ProjectRepository.class);
    private OpportunityFormRepository formRepository = mock(OpportunityFormRepository.class);
    private OpportunityQuestionRepository questionRepository = mock(OpportunityQuestionRepository.class);
    private OpportunityOptionRepository optionRepository = mock(OpportunityOptionRepository.class);
    private OpportunityAnswerRepository answerRepository = mock(OpportunityAnswerRepository.class);
    private ReportTicketRepository reportTicketRepository = mock(ReportTicketRepository.class);

    private OpportunityServiceImpl opportunityService;

    @BeforeEach
    void setup() {
        opportunityService = new OpportunityServiceImpl(
                opportunityRepository, applicationRepository, humanRepository, groupRepository, projectRepository,
                formRepository, questionRepository, optionRepository, answerRepository, reportTicketRepository
        );
    }

    @Test
    @DisplayName("Metodo createOpportunity: Deve cadastrar novo edital/bolsa de oportunidade e retornar o objeto cadastrado")
    void testCreateOpportunity_Sucesso() {
        UUID creatorId = UUID.randomUUID();
        Human creator = mock(Human.class);
        Opportunity oppMock = mock(Opportunity.class);
        when(oppMock.getName()).thenReturn("Bolsa de Iniciação Científica IA");

        when(humanRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(opportunityRepository.save(any(Opportunity.class))).thenReturn(oppMock);

        OportunidadeCadastroRequest req = new OportunidadeCadastroRequest(
                "Bolsa de Iniciação Científica IA", "Pesquisa em IA aplicada", 1,
                null, null, null, true, "R$ 700,00", false, "99999", LocalDate.now().plusDays(30), null, null
        );

        Opportunity response = opportunityService.createOpportunity(creatorId, req, creatorId);

        assertNotNull(response, "O retorno do metodo createOpportunity nao deve ser nulo");
        assertEquals("Bolsa de Iniciação Científica IA", response.getName(), "O titulo da oportunidade retornada deve bater com a requisicao");
        verify(opportunityRepository).save(any(Opportunity.class));
    }

    @Test
    @DisplayName("Metodo applyWithAnswers: Deve registrar candidatura de aluno em edital com sucesso")
    void testApply_Sucesso() {
        UUID oppId = UUID.randomUUID();
        UUID applicantId = UUID.randomUUID();
        Opportunity opp = mock(Opportunity.class);
        Human applicant = mock(Human.class);

        when(opp.getRecordStatus()).thenReturn(1);
        when(opportunityRepository.findById(oppId)).thenReturn(Optional.of(opp));
        when(humanRepository.findById(applicantId)).thenReturn(Optional.of(applicant));
        when(applicationRepository.findByOpportunityAndHuman(opp, applicant)).thenReturn(Optional.empty());
        when(applicationRepository.save(any(OpportunityApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CandidaturaRequest req = new CandidaturaRequest("Tenho interesse na bolsa", "83999999999", null);

        OpportunityApplication app = opportunityService.applyWithAnswers(oppId, applicantId, req, applicantId);

        assertNotNull(app, "A candidatura retornada nao deve ser nula");
        verify(applicationRepository).save(any());
    }
}
