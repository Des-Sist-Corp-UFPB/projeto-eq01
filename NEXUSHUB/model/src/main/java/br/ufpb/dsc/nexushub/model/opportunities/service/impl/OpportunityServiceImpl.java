package br.ufpb.dsc.nexushub.model.opportunities.service.impl;

import br.ufpb.dsc.nexushub.model.administration.domain.ReportTicket;
import br.ufpb.dsc.nexushub.model.administration.repository.ReportTicketRepository;
import br.ufpb.dsc.nexushub.model.dto.*;
import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.opportunities.domain.*;
import br.ufpb.dsc.nexushub.model.opportunities.repository.*;
import br.ufpb.dsc.nexushub.model.opportunities.service.OpportunityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpportunityServiceImpl implements OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityApplicationRepository applicationRepository;
    private final HumanRepository humanRepository;
    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;
    private final OpportunityFormRepository formRepository;
    private final OpportunityQuestionRepository questionRepository;
    private final OpportunityOptionRepository optionRepository;
    private final OpportunityAnswerRepository answerRepository;
    private final ReportTicketRepository reportTicketRepository;

    public OpportunityServiceImpl(
            OpportunityRepository opportunityRepository,
            OpportunityApplicationRepository applicationRepository,
            HumanRepository humanRepository,
            GroupRepository groupRepository,
            ProjectRepository projectRepository,
            OpportunityFormRepository formRepository,
            OpportunityQuestionRepository questionRepository,
            OpportunityOptionRepository optionRepository,
            OpportunityAnswerRepository answerRepository,
            ReportTicketRepository reportTicketRepository
    ) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.humanRepository = humanRepository;
        this.groupRepository = groupRepository;
        this.projectRepository = projectRepository;
        this.formRepository = formRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.answerRepository = answerRepository;
        this.reportTicketRepository = reportTicketRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OportunidadeResponse> listOpenOpportunities() {
        return opportunityRepository.findAll().stream()
                .filter(o -> o.getRecordStatus() == 1 && o.getStatus() == 1)
                .map(this::mapToResponse)
                .sorted((r1, r2) -> Integer.compare(calculateScore(r2), calculateScore(r1))) // Descending score order
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OportunidadeResponse getOpportunityDetails(UUID id) {
        Opportunity o = opportunityRepository.findById(id)
                .filter(opp -> opp.getRecordStatus() == 1)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade não encontrada."));
        return mapToResponse(o);
    }

    @Override
    @Transactional
    public Opportunity createOpportunity(UUID publisherHumanId, OportunidadeCadastroRequest request, UUID updatedById) {
        Human publisher = humanRepository.findById(publisherHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Publicador não encontrado."));
        Group group = request.idGrupo() == null ? null : groupRepository.findById(request.idGrupo()).orElse(null);
        Project project = request.idProjeto() == null ? null : projectRepository.findById(request.idProjeto()).orElse(null);

        Opportunity o = new Opportunity(
                group,
                project,
                publisher,
                request.titulo(),
                request.descricao(),
                request.tipo() == null ? 1 : request.tipo(),
                request.tagType(),
                request.pago(),
                request.remuneracao(),
                request.usaFormulario(),
                request.telefoneContato(),
                request.prazo(),
                updatedById
        );

        Opportunity savedO = opportunityRepository.save(o);

        if (request.usaFormulario() && request.perguntas() != null && !request.perguntas().isEmpty()) {
            saveFormStructure(savedO, request.perguntas(), updatedById);
        }

        return savedO;
    }

    @Override
    @Transactional
    public Opportunity updateOpportunity(UUID id, OportunidadeCadastroRequest request, UUID updatedById) {
        Opportunity o = opportunityRepository.findById(id)
                .filter(opp -> opp.getRecordStatus() == 1)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade não encontrada."));

        o.updateDetails(
                request.titulo(),
                request.descricao(),
                request.tipo() == null ? 1 : request.tipo(),
                request.tagType(),
                request.pago(),
                request.remuneracao(),
                request.usaFormulario(),
                request.telefoneContato(),
                request.prazo(),
                updatedById
        );

        Opportunity savedO = opportunityRepository.save(o);

        // Delete old form structures if they exist
        formRepository.findByOpportunityIdAndRecordStatus(o.getId(), 1).ifPresent(oldForm -> {
            oldForm.deactivate(updatedById);
            formRepository.save(oldForm);
            
            List<OpportunityQuestion> oldQs = questionRepository.findByFormIdAndRecordStatusOrderBySortOrderAsc(oldForm.getId(), 1);
            for (OpportunityQuestion q : oldQs) {
                q.deactivate(updatedById);
                questionRepository.save(q);
                
                List<OpportunityOption> oldOpts = optionRepository.findByQuestionIdAndRecordStatusOrderBySortOrderAsc(q.getId(), 1);
                for (OpportunityOption opt : oldOpts) {
                    opt.deactivate(updatedById);
                    optionRepository.save(opt);
                }
            }
        });

        // Save new form structure if enabled
        if (request.usaFormulario() && request.perguntas() != null && !request.perguntas().isEmpty()) {
            saveFormStructure(savedO, request.perguntas(), updatedById);
        }

        return savedO;
    }

    @Override
    @Transactional
    public void deleteOpportunity(UUID id, UUID updatedById) {
        Opportunity o = opportunityRepository.findById(id)
                .filter(opp -> opp.getRecordStatus() == 1)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade não encontrada."));
        o.deactivate(updatedById);
        opportunityRepository.save(o);
    }

    @Override
    @Transactional
    public void reportOpportunity(UUID id, String reason, UUID reporterId) {
        Opportunity o = opportunityRepository.findById(id)
                .filter(opp -> opp.getRecordStatus() == 1)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade não encontrada."));

        ReportTicket ticket = new ReportTicket(
                UUID.randomUUID(),
                "OPPORTUNITY",
                o.getId(),
                reason,
                "PENDING",
                LocalDateTime.now(),
                null
        );
        reportTicketRepository.save(ticket);
    }

    @Override
    @Transactional
    public OpportunityApplication applyWithAnswers(UUID opportunityId, UUID humanId, CandidaturaRequest request, UUID updatedById) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .filter(opp -> opp.getRecordStatus() == 1)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade não encontrada."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa não encontrada."));

        // Pre-check if application already exists
        Optional<OpportunityApplication> existing = applicationRepository.findByOpportunityAndHuman(opportunity, human);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Você já se candidatou a esta oportunidade.");
        }

        OpportunityApplication app = new OpportunityApplication(
                opportunity,
                human,
                request.mensagem(),
                request.telefone(),
                updatedById
        );
        OpportunityApplication savedApp = applicationRepository.save(app);

        if (opportunity.isUseForm()) {
            OpportunityForm form = formRepository.findByOpportunityIdAndRecordStatus(opportunity.getId(), 1)
                    .orElseThrow(() -> new IllegalArgumentException("Formulário de candidatura não encontrado."));

            List<OpportunityQuestion> questions = questionRepository.findByFormIdAndRecordStatusOrderBySortOrderAsc(form.getId(), 1);
            Map<UUID, String> answerMap = new HashMap<>();
            if (request.respostas() != null) {
                for (RespostaCandidaturaRequest r : request.respostas()) {
                    answerMap.put(r.idPergunta(), r.respostaText());
                }
            }

            // Validate mandatory questions
            for (OpportunityQuestion q : questions) {
                String ans = answerMap.get(q.getId());
                if (q.isRequired() && (ans == null || ans.trim().isEmpty())) {
                    throw new IllegalArgumentException("A pergunta '" + q.getLabel() + "' é obrigatória.");
                }
                if (ans != null && !ans.trim().isEmpty()) {
                    answerRepository.save(new OpportunityAnswer(savedApp, q, ans.trim(), updatedById));
                }
            }
        }

        return savedApp;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OportunidadeDashboardResponse> listCreatorDashboard(UUID publisherHumanId) {
        Human publisher = humanRepository.findById(publisherHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Criador não encontrado."));
        List<Opportunity> opportunities = opportunityRepository.findByPublisher(publisher).stream()
                .filter(o -> o.getRecordStatus() == 1)
                .toList();

        List<OportunidadeDashboardResponse> dashboard = new ArrayList<>();
        for (Opportunity o : opportunities) {
            List<OpportunityApplication> applications = applicationRepository.findByOpportunityIdAndRecordStatus(o.getId(), 1);
            List<OportunidadeDashboardResponse.CandidaturaDashboardResponse> appResponses = new ArrayList<>();
            
            for (OpportunityApplication app : applications) {
                List<OpportunityAnswer> answers = answerRepository.findByApplicationIdAndRecordStatus(app.getId(), 1);
                List<OportunidadeDashboardResponse.RespostaDashboardResponse> ansResponses = new ArrayList<>();
                for (OpportunityAnswer ans : answers) {
                    ansResponses.add(new OportunidadeDashboardResponse.RespostaDashboardResponse(
                            ans.getQuestion().getId(),
                            ans.getQuestion().getLabel(),
                            ans.getAnswerText()
                    ));
                }

                // Check audit/created date, fallback to now if null
                LocalDateTime appliedTime = app.getUpdatedAt() != null ? app.getUpdatedAt() : LocalDateTime.now();

                appResponses.add(new OportunidadeDashboardResponse.CandidaturaDashboardResponse(
                        app.getId(),
                        app.getHuman().getId(),
                        app.getHuman().getName(),
                        app.getHuman().getEmail(),
                        app.getMessage(),
                        app.getPhone(),
                        app.getApplicationStatus(),
                        appliedTime,
                        ansResponses
                ));
            }

            dashboard.add(new OportunidadeDashboardResponse(
                    o.getId(),
                    o.getName(),
                    o.getStatus(),
                    appResponses.size(),
                    appResponses
            ));
        }

        return dashboard;
    }

    private void saveFormStructure(Opportunity o, List<PerguntaRequest> perguntas, UUID updatedById) {
        OpportunityForm form = formRepository.save(new OpportunityForm(o, "Formulário de " + o.getName(), updatedById));
        for (PerguntaRequest pReq : perguntas) {
            OpportunityQuestion q = questionRepository.save(new OpportunityQuestion(
                    form,
                    pReq.label(),
                    pReq.tipo(),
                    pReq.obrigatoria(),
                    pReq.ordem(),
                    updatedById
            ));

            if (pReq.opcoes() != null && !pReq.opcoes().isEmpty()) {
                int optIdx = 0;
                for (String optName : pReq.opcoes()) {
                    if (optName != null && !optName.trim().isEmpty()) {
                        optionRepository.save(new OpportunityOption(q, optName.trim(), optIdx++, updatedById));
                    }
                }
            }
        }
    }

    private OportunidadeResponse mapToResponse(Opportunity o) {
        Optional<OpportunityForm> formOpt = formRepository.findByOpportunityIdAndRecordStatus(o.getId(), 1);
        OportunidadeResponse.FormularioResponse formResponse = null;

        if (formOpt.isPresent()) {
            OpportunityForm form = formOpt.get();
            List<OportunidadeResponse.PerguntaResponse> questionResponses = questionRepository.findByFormIdAndRecordStatusOrderBySortOrderAsc(form.getId(), 1).stream()
                    .map(q -> {
                        List<OportunidadeResponse.OpcaoResponse> optionResponses = optionRepository.findByQuestionIdAndRecordStatusOrderBySortOrderAsc(q.getId(), 1).stream()
                                .map(opt -> new OportunidadeResponse.OpcaoResponse(opt.getId(), opt.getOptionName(), opt.getSortOrder()))
                                .toList();
                        return new OportunidadeResponse.PerguntaResponse(
                                q.getId(),
                                q.getLabel(),
                                q.getType(),
                                q.isRequired(),
                                q.getSortOrder(),
                                optionResponses
                        );
                    })
                    .toList();

            formResponse = new OportunidadeResponse.FormularioResponse(form.getId(), form.getName(), questionResponses);
        }

        return OportunidadeResponse.from(o, formResponse);
    }

    private int calculateScore(OportunidadeResponse r) {
        int score = 100; // Base score
        if ("Professor".equalsIgnoreCase(r.tipoUsuarioPublicador())) {
            score += 100;
        } else if ("Aluno".equalsIgnoreCase(r.tipoUsuarioPublicador())) {
            score += 10;
        }
        // Penalize older opportunities slightly to reward fresh ones
        // If deadline is passed, we could also depress the score, but order is mostly by publisher type weight
        return score;
    }
}
