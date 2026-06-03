package br.ufpb.dsc.nexushub.controller.config;

import br.ufpb.dsc.nexushub.model.entity.Grupo;
import br.ufpb.dsc.nexushub.model.entity.Oportunidade;
import br.ufpb.dsc.nexushub.model.entity.Projeto;
import br.ufpb.dsc.nexushub.model.entity.Usuario;
import br.ufpb.dsc.nexushub.model.repository.GrupoRepository;
import br.ufpb.dsc.nexushub.model.repository.OportunidadeRepository;
import br.ufpb.dsc.nexushub.model.repository.ProjetoRepository;
import br.ufpb.dsc.nexushub.model.repository.UsuarioRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProjetoRepository projetoRepository;
    private final GrupoRepository grupoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            ProjetoRepository projetoRepository,
            GrupoRepository grupoRepository,
            OportunidadeRepository oportunidadeRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.projetoRepository = projetoRepository;
        this.grupoRepository = grupoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Popular Usuarios com senhas criptografadas
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario(
                    "Rodrigo Silva",
                    "rodrigo@nexushub.com",
                    passwordEncoder.encode("senha123"),
                    "ESTUDANTE"
            ));
            usuarioRepository.save(new Usuario(
                    "Kassio Leite",
                    "kassio@nexushub.com",
                    passwordEncoder.encode("senha123"),
                    "PROFESSOR"
            ));
        }

        // Garantir o Sysadmin John Wesley
        if (usuarioRepository.findByEmail("john@nexushub.com").isEmpty()) {
            usuarioRepository.save(new Usuario(
                    "John Wesley",
                    "john@nexushub.com",
                    passwordEncoder.encode("senha123"),
                    "SYSADMIN"
            ));
        }

        // 2. Popular Grupos
        if (grupoRepository.count() == 0) {
            grupoRepository.save(new Grupo(
                    "Laboratorio de Inovacao e Ideias",
                    "Grupo pioneiro focado em desenvolver solucoes tecnologicas para o campus.",
                    "Institucional",
                    "Rodrigo Silva",
                    "Aberto",
                    "#1e3a8a",
                    "💡"
            ));
            grupoRepository.save(new Grupo(
                    "Núcleo de Robotica Aplicada",
                    "Equipe focada no ensino de mecatronica e automacao.",
                    "Institucional",
                    "Kassio Leite",
                    "Restrito",
                    "#0f766e",
                    "🤖"
            ));
            grupoRepository.save(new Grupo(
                    "DEV UFPB - Comunidade de Devs",
                    "Espaço para desenvolvedores da universidade compartilharem projetos e dicas.",
                    "Comunidade",
                    "Rodrigo Silva",
                    "Aberto",
                    "#4338ca",
                    "💻"
            ));
            grupoRepository.save(new Grupo(
                    "Grupo de Corrida Campus I",
                    "Grupo de corrida e saúde integrando estudantes e servidores da UFPB.",
                    "Comunidade",
                    "Kassio Leite",
                    "Aberto",
                    "#b91c1c",
                    "🏃"
            ));
            grupoRepository.save(new Grupo(
                    "Parceiros do Ecossistema - ACME Corp",
                    "Parcerias externas trazendo projetos do mercado e mentorias de carreira.",
                    "Externo",
                    "Rodrigo Silva",
                    "Restrito",
                    "#b45309",
                    "🏢"
            ));
        }

        // Garantir o grupo Ayty
        if (grupoRepository.findAll().stream().noneMatch(g -> g.getNome().equalsIgnoreCase("Ayty"))) {
            grupoRepository.save(new Grupo(
                    "Ayty",
                    "Grupo de pesquisa e desenvolvimento focado em inovacao tecnologica, engenharia de software e parcerias com o mercado.",
                    "Institucional",
                    "Rodrigo Silva",
                    "Aberto",
                    "#059669",
                    "🌱"
            ));
        }

        // Garantir o grupo NEO Ethical Hackers
        if (grupoRepository.findAll().stream().noneMatch(g -> g.getNome().equalsIgnoreCase("NEO Ethical Hackers"))) {
            grupoRepository.save(new Grupo(
                    "NEO Ethical Hackers",
                    "Comunidade de estudantes interessados em seguranca da informacao, testes de intrusao, CTFs e praticas de defesa cibernetica.",
                    "Comunidade",
                    "John Wesley",
                    "Aberto",
                    "#7c3aed",
                    "🛡️"
            ));
        }

        // 3. Popular Oportunidades
        if (oportunidadeRepository.count() == 0) {
            oportunidadeRepository.save(new Oportunidade(
                    "Selecao de membros para projeto piloto",
                    "Chamada para estudantes interessados em testar e evoluir o NEXUS HUB.",
                    "Voluntariado",
                    "rodrigo@nexushub.com",
                    LocalDate.now().plusDays(30)
            ));
        }

        if (oportunidadeRepository.findAll().stream().noneMatch(o -> o.getTitulo().contains("Phoebus"))) {
            oportunidadeRepository.save(new Oportunidade(
                    "Desenvolvedor Backend (Phoebus)",
                    "Vaga para atuar no desenvolvimento da API de pagamentos Phoebus utilizando Spring Boot.",
                    "Bolsista",
                    "rodrigo@nexushub.com",
                    LocalDate.now().plusDays(15)
            ));
        }

        if (oportunidadeRepository.findAll().stream().noneMatch(o -> o.getTitulo().contains("Viva Moveis"))) {
            oportunidadeRepository.save(new Oportunidade(
                    "Designer UI/UX (Viva Moveis)",
                    "Vaga voluntaria para construcao de interfaces de modelagem 3D e prototipagem no projeto Viva Moveis.",
                    "Voluntariado",
                    "rodrigo@nexushub.com",
                    LocalDate.now().plusDays(25)
            ));
        }

        // Imagens mockadas usando imagens funcionais de alta qualidade relacionadas a tecnologia
        String techImg1 = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop";
        String techImg2 = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop";
        String techImg3 = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop";
        String techImg4 = "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop";
        String techImg5 = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop";

        // 4. Popular Projetos Completos e Ricos em Detalhes
        if (projetoRepository.count() == 0) {
            
            // Projeto 1: Mapa de Projetos Acadêmicos (Hot, Recent, Colab)
            projetoRepository.save(new Projeto(
                    "Mapa de Projetos Academicos",
                    "Catalogo interativo para centralizar, catalogar e divulgar projetos, grupos e vagas do campus.",
                    "Criar um ambiente digital unificado que aumente a visibilidade e participação acadêmica dos estudantes.",
                    "Extensao",
                    "Extensão",
                    "Angular, Spring Boot, PostgreSQL, Java",
                    "PUBLICO_ABERTO",
                    "Laboratorio de Inovacao e Ideias",
                    "Rodrigo Silva",
                    14, // curtidas
                    6,  // membros
                    techImg1,
                    techImg1,
                    350 // XP Distribuido (Rank alto)
            ));

            // Projeto 2: Laboratório de Ideias com IA (Hot, Research)
            projetoRepository.save(new Projeto(
                    "Plataforma de IA para Diagnostico",
                    "Pesquisa aplicada no uso de redes neurais convolucionais para analise de exames de imagem.",
                    "Desenvolver modelos preditivos open-source com precisao superior a 90% para hospitais publicos.",
                    "Pesquisa",
                    "Pesquisa",
                    "Python, Machine Learning, TensorFlow, IA",
                    "PUBLICO",
                    "Laboratorio de Inovacao e Ideias",
                    "Rodrigo Silva",
                    28, // curtidas (Mais quentes)
                    8,  // membros
                    techImg2,
                    techImg2,
                    650 // XP Distribuido (Super Hot)
            ));

            // Projeto 3: Iniciativa de Robótica Escolar (Colab)
            projetoRepository.save(new Projeto(
                    "Robotica nas Escolas Publicas",
                    "Projeto de extensao para ensinar programacao de computadores e robotica basica a alunos do ensino medio.",
                    "Levar kits basicos de Arduino e sensores para 10 escolas publicas parceiras da regiao metropolitana.",
                    "Extensao",
                    "Extensão",
                    "Arduino, C++, IoT, Ensino",
                    "PUBLICO_ABERTO",
                    "Núcleo de Robotica Aplicada",
                    "Kassio Leite",
                    19, // curtidas
                    12, // membros
                    techImg3,
                    techImg3,
                    500 // XP Distribuido (Hot)
            ));

            // Projeto 4: Portal de Oportunidades UFPB (Recent)
            projetoRepository.save(new Projeto(
                    "Portal de Oportunidades UFPB",
                    "Mural de vagas dinâmico conectando estudantes a estagios, monitorias e bolsas de pesquisa.",
                    "Facilitar o acesso democratizado às bolsas internas de monitoria e pesquisa na universidade.",
                    "Extensao",
                    "Extensão",
                    "React, Spring Boot, MySQL",
                    "PUBLICO_ABERTO",
                    "Laboratorio de Inovacao e Ideias",
                    "Kassio Leite",
                    5, // curtidas
                    3, // membros
                    techImg4,
                    techImg4,
                    150 // XP Distribuido
            ));

            // Projeto 5: NexusHub Mobile App (Recent, Colab)
            projetoRepository.save(new Projeto(
                    "NexusHub App Mobile",
                    "Aplicativo mobile nativo para iOS e Android do ecossistema centralizador do campus.",
                    "Oferecer notificações push sobre eventos academicos e oportunidades de ultima hora direto no celular.",
                    "Inovacao",
                    "Interno",
                    "Flutter, Dart, Firebase, Android",
                    "PRIVADO",
                    "Laboratorio de Inovacao e Ideias",
                    "Rodrigo Silva",
                    12, // curtidas
                    5,  // membros
                    techImg5,
                    techImg5,
                    450 // XP
            ));
        }

        // Garantir os projetos do Ayty
        if (projetoRepository.findAll().stream().noneMatch(p -> p.getNome().equalsIgnoreCase("Phoebus"))) {
            projetoRepository.save(new Projeto(
                    "Phoebus",
                    "Plataforma de integracao e inteligencia voltada para facilitacao de processos de pagamento e conciliacao financeira.",
                    "Desenvolver soluções inovadoras de intermediação financeira e automação de pagamentos.",
                    "Inovacao",
                    "Interno",
                    "Java, Spring Boot, React, PostgreSQL",
                    "PUBLICO_ABERTO",
                    "Ayty",
                    "Rodrigo Silva",
                    18,
                    4,
                    techImg1,
                    techImg1,
                    300
            ));
        }

        if (projetoRepository.findAll().stream().noneMatch(p -> p.getNome().equalsIgnoreCase("Viva Moveis"))) {
            projetoRepository.save(new Projeto(
                    "Viva Moveis",
                    "Sistema inteligente de design e gerenciamento de inventario de moveis corporativos integrando realidade aumentada.",
                    "Otimizar a alocação e visualização tridimensional de layout para móveis corporativos sustentáveis.",
                    "Extensao",
                    "Extensão",
                    "TypeScript, Angular, NestJS, MongoDB",
                    "PUBLICO_ABERTO",
                    "Ayty",
                    "Rodrigo Silva",
                    22,
                    6,
                    techImg3,
                    techImg3,
                    450
            ));
        }

        // Garantir os projetos do NEO Ethical Hackers
        if (projetoRepository.findAll().stream().noneMatch(p -> p.getNome().equalsIgnoreCase("Desafio CTF Nexus"))) {
            projetoRepository.save(new Projeto(
                    "Desafio CTF Nexus",
                    "Plataforma gamificada para competicoes e simulacoes realistas de seguranca defensiva e testes de invasao.",
                    "Estimular o aprendizado de tecnicas de seguranca cibernetica e formar equipes capacitadas para hacking etico.",
                    "Pesquisa",
                    "Interno",
                    "Seguranca, Pentest, CTF, RedTeam",
                    "PUBLICO_ABERTO",
                    "NEO Ethical Hackers",
                    "John Wesley",
                    25,
                    8,
                    techImg2,
                    techImg2,
                    550
            ));
        }
    }
}
