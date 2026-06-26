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

        User rodrigo = identityService.registerUser("Rodrigo Silva", "rodrigo@nexushub.com", "senha123", "STUDENT");
        User kassio = identityService.registerUser("Kassio Leite", "kassio@nexushub.com", "senha123", "PROFESSOR");
        User john = identityService.registerUser("John Wesley", "john@nexushub.com", "senha123", "SYSADMIN");

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

        Group ayty = groupService.createGroup(
                "Ayty",
                "Grupo de pesquisa e desenvolvimento focado em inovacao tecnologica, engenharia de software e parcerias com o mercado.",
                1,
                rodrigo.getHuman().getId(),
                rodrigo.getId()
        );

        Group neoEthicalHackers = groupService.createGroup(
                "NEO Ethical Hackers",
                "Comunidade de estudantes interessados em seguranca da informacao, testes de intrusao, CTFs e praticas de defesa cibernetica.",
                2,
                john.getHuman().getId(),
                john.getId()
        );

        Project mapProject = projectService.createProject(new ProjetoRequest(
                "Mapa de Projetos Academicos",
                "Catalogo interativo para centralizar, catalogar e divulgar projetos, grupos e vagas do campus.",
                "Criar um ambiente digital unificado que aumente a visibilidade e participacao academica.",
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

        Project roboticsProject = projectService.createProject(new ProjetoRequest(
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

        Project portalProject = projectService.createProject(new ProjetoRequest(
                "Portal de Oportunidades UFPB",
                "Mural de vagas dinâmico conectando estudantes a estagios, monitorias e bolsas de pesquisa.",
                "Facilitar o acesso democratizado as bolsas internas de monitoria e pesquisa na universidade.",
                "Extensao",
                "1",
                "React, Spring Boot, MySQL",
                "2",
                innovationLab.getName(),
                innovationLab.getId(),
                kassio.getHuman().getId(),
                kassio.getHuman().getName(),
                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop",
                150
        ));

        Project mobileProject = projectService.createProject(new ProjetoRequest(
                "NexusHub App Mobile",
                "Aplicativo mobile nativo para iOS e Android do ecossistema centralizador do campus.",
                "Oferecer notificacoes push sobre eventos academicos e oportunidades de ultima hora direto no celular.",
                "Inovacao",
                "2",
                "Flutter, Dart, Firebase, Android",
                "1",
                innovationLab.getName(),
                innovationLab.getId(),
                rodrigo.getHuman().getId(),
                rodrigo.getHuman().getName(),
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop",
                450
        ));

        Project phoebus = projectService.createProject(new ProjetoRequest(
                "Phoebus",
                "Plataforma de integracao e inteligencia voltada para facilitacao de processos de pagamento e conciliacao financeira.",
                "Desenvolver solucoes inovadoras de intermediacao financeira e automacao de pagamentos.",
                "Inovacao",
                "2",
                "Java, Spring Boot, React, PostgreSQL",
                "2",
                ayty.getName(),
                ayty.getId(),
                rodrigo.getHuman().getId(),
                rodrigo.getHuman().getName(),
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop",
                300
        ));

        Project vivaMoveis = projectService.createProject(new ProjetoRequest(
                "Viva Moveis",
                "Sistema inteligente de design e gerenciamento de inventario de moveis corporativos integrando realidade aumentada.",
                "Otimizar a alocacao e visualizacao tridimensional de layout para moveis corporativos sustentaveis.",
                "Extensao",
                "1",
                "TypeScript, Angular, NestJS, MongoDB",
                "2",
                ayty.getName(),
                ayty.getId(),
                rodrigo.getHuman().getId(),
                rodrigo.getHuman().getName(),
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
                450
        ));

        Project ctfNexus = projectService.createProject(new ProjetoRequest(
                "Desafio CTF Nexus",
                "Plataforma gamificada para competicoes e simulacoes realistas de seguranca defensiva e testes de invasao.",
                "Estimular o aprendizado de tecnicas de seguranca cibernetica e formar equipes capacitadas para hacking etico.",
                "Pesquisa",
                "2",
                "Seguranca, Pentest, CTF, RedTeam",
                "2",
                neoEthicalHackers.getName(),
                neoEthicalHackers.getId(),
                john.getHuman().getId(),
                john.getHuman().getName(),
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop",
                550
        ));

        opportunityService.createOpportunity(
                rodrigo.getHuman().getId(),
                innovationLab.getId(),
                mapProject.getId(),
                "Selecao de membros para projeto piloto",
                "Chamada para estudantes interessados em testar e evoluir o NEXUS HUB.",
                4,
                rodrigo.getId()
        );

        opportunityService.createOpportunity(
                rodrigo.getHuman().getId(),
                ayty.getId(),
                phoebus.getId(),
                "Desenvolvedor Backend (Phoebus)",
                "Vaga para atuar no desenvolvimento da API de pagamentos Phoebus utilizando Spring Boot.",
                3,
                rodrigo.getId()
        );

        opportunityService.createOpportunity(
                rodrigo.getHuman().getId(),
                ayty.getId(),
                vivaMoveis.getId(),
                "Designer UI/UX (Viva Moveis)",
                "Vaga voluntaria para construcao de interfaces de modelagem 3D e prototipagem no projeto Viva Moveis.",
                4,
                rodrigo.getId()
        );
    }
}
