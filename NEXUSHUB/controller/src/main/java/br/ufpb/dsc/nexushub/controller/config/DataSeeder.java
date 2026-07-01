package br.ufpb.dsc.nexushub.controller.config;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import br.ufpb.dsc.nexushub.model.groups.service.GroupService;
import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.opportunities.service.OpportunityService;
import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import br.ufpb.dsc.nexushub.model.projects.service.ProjectService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final IdentityService identityService;
    private final GroupService groupService;
    private final ProjectService projectService;
    private final OpportunityService opportunityService;

    public DataSeeder(
            IdentityService identityService,
            GroupService groupService,
            ProjectService projectService,
            OpportunityService opportunityService
    ) {
        this.identityService = identityService;
        this.groupService = groupService;
        this.projectService = projectService;
        this.opportunityService = opportunityService;
    }

    @Override
    public void run(String... args) {
        if (identityService.hasUsers()) {
            return;
        }

        User rodrigo = identityService.registerUser("Rodrigo Silva", "rodrigo@nexushub.com", "senha123", "STUDENT", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
        User kassio = identityService.registerUser("Kassio Leite", "kassio@nexushub.com", "senha123", "PROFESSOR", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150");
        User john = identityService.registerUser("John Wesley", "john@nexushub.com", "senha123", "SYSADMIN", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150");

        Group innovationLab = groupService.createGroup(
                "Laboratorio de Inovacao e Ideias",
                "Grupo focado em solucoes tecnologicas para o campus.",
                1,
                rodrigo.getHuman().getId(),
                rodrigo.getId()
        );

        Group robotics = groupService.createGroup(
                "Nucleo de Robotica Aplicada",
                "Equipe focada no ensino de mecatronica e automacao.",
                1,
                kassio.getHuman().getId(),
                kassio.getId()
        );

        Project mapProject = projectService.createProject(new ProjetoRequest(
                "Mapa de Projetos Academicos",
                "Catalogo interativo para centralizar, catalogar e divulgar projetos, grupos e vagas do campus.",
                "Criar um ambiente digital unificado que aumente a visibilidade academica.",
                "Extensao",
                "1",
                "Angular, Spring Boot, PostgreSQL, Java",
                "2",
                innovationLab.getName(),
                innovationLab.getId(),
                rodrigo.getHuman().getId(),
                rodrigo.getHuman().getName(),
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop",
                350
        ));

        projectService.createProject(new ProjetoRequest(
                "Robotica nas Escolas Publicas",
                "Projeto de extensao para ensinar programacao e robotica basica a alunos do ensino medio.",
                "Levar kits de Arduino e sensores para escolas publicas parceiras.",
                "Extensao",
                "1",
                "Arduino, C++, IoT, Ensino",
                "2",
                robotics.getName(),
                robotics.getId(),
                kassio.getHuman().getId(),
                kassio.getHuman().getName(),
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
                500
        ));

        opportunityService.createOpportunity(
                john.getHuman().getId(),
                innovationLab.getId(),
                mapProject.getId(),
                "Selecao de membros para projeto piloto",
                "Chamada para estudantes interessados em testar e evoluir o NEXUS HUB.",
                4,
                john.getId()
        );
    }
}
