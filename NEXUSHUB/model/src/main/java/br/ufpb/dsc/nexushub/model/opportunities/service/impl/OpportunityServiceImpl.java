package br.ufpb.dsc.nexushub.model.opportunities.service.impl;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.repository.GroupRepository;
import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import br.ufpb.dsc.nexushub.model.opportunities.domain.OpportunityApplication;
import br.ufpb.dsc.nexushub.model.opportunities.repository.OpportunityApplicationRepository;
import br.ufpb.dsc.nexushub.model.opportunities.repository.OpportunityRepository;
import br.ufpb.dsc.nexushub.model.opportunities.service.OpportunityService;
import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.repository.ProjectRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpportunityServiceImpl implements OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityApplicationRepository applicationRepository;
    private final HumanRepository humanRepository;
    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;

    public OpportunityServiceImpl(
            OpportunityRepository opportunityRepository,
            OpportunityApplicationRepository applicationRepository,
            HumanRepository humanRepository,
            GroupRepository groupRepository,
            ProjectRepository projectRepository
    ) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.humanRepository = humanRepository;
        this.groupRepository = groupRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Opportunity> listOpenOpportunities() {
        return opportunityRepository.findAll().stream()
                .filter(opportunity -> opportunity.getRecordStatus() == 1)
                .toList();
    }

    @Override
    @Transactional
    public Opportunity createOpportunity(UUID publisherHumanId, UUID groupId, UUID projectId, String name, String description, Integer type, UUID updatedById) {
        Human publisher = humanRepository.findById(publisherHumanId)
                .orElseThrow(() -> new IllegalArgumentException("Publicador nao encontrado."));
        Group group = groupId == null ? null : groupRepository.findById(groupId).orElse(null);
        Project project = projectId == null ? null : projectRepository.findById(projectId).orElse(null);
        return opportunityRepository.save(new Opportunity(group, project, publisher, name, description, type == null ? 1 : type, updatedById));
    }

    @Override
    @Transactional
    public OpportunityApplication apply(UUID opportunityId, UUID humanId, String message, UUID updatedById) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new IllegalArgumentException("Oportunidade nao encontrada."));
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa nao encontrada."));
        return applicationRepository.findByOpportunityAndHuman(opportunity, human)
                .orElseGet(() -> applicationRepository.save(new OpportunityApplication(opportunity, human, message, updatedById)));
    }
}
