# 🎓 NexusHub

> Plataforma acadêmica gamificada para centralizar projetos, grupos, eventos, lojinha comunitária e oportunidades universitárias.

NexusHub conecta estudantes, professores, projetos, grupos e oportunidades em um único ambiente digital. A ideia é reduzir a perda de informações espalhadas e transformar participação acadêmica em reconhecimento por meio de pontos, rankings, conquistas e perfis acadêmicos personalizados.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza um conjunto de tecnologias modernas e robustas:

* **Backend:** Java 21, Spring Boot (REST API), JPA/Hibernate, Flyway (Migrações do banco), Maven
* **Frontend:** Angular 21 (TypeScript, RxJS, Signals)
* **Banco de Dados:** PostgreSQL 16
* **Containerização:** Docker & Docker Compose

---

## 📐 Estrutura do Projeto

O projeto segue o padrão **MVC (Model-View-Controller)** de forma explícita, organizado nos seguintes diretórios:

```text
projeto-eq01
└── NEXUSHUB
    ├── model          # Módulo Java com entidades, DTOs, repositórios e regras de negócio.
    ├── controller     # Módulo Spring Boot (API REST).
    ├── view           # Aplicação Angular (interface com usuário).
    └── Dockerfile & docker-compose.yml
```

### Links Rápidos dos Componentes:
* [Módulo Model](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model)
* [Módulo Controller](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/controller)
* [Módulo Frontend (Angular)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/view)
* [Configuração do Docker Compose](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/docker-compose.yml)

---

## 🌟 Funcionalidades do Projeto

### 1. Perfil Acadêmico Completo e Flexível
* **Onboarding Acadêmico**: Passo a passo de boas-vindas para registrar nome, data de nascimento (com controle de visibilidade), curso e período.
* **Período Customizado**: O campo período suporta formatos textuais como `2023.1` ou numéricos simples (`5`). A renderização é inteligente para remover a formatação ordinal (`º`) caso contenha caracteres de semestre (ex: `.1`).
* **Seções Detalhadas**: Biografia, histórico de experiências, formação, competências técnicas e stacks de tecnologias.
* **Redes & Contatos**: Integração direta com WhatsApp, LinkedIn, GitHub, Instagram e sites pessoais.

### 2. Comunidades (Grupos e Projetos vinculados)
* **Estrutura Hierárquica**: Um grupo acadêmico pode possuir múltiplos projetos, porém todo projeto deve obrigatoriamente estar vinculado a um grupo responsável.
* **Mural de Mensagens**: Murais de comunicação em tempo real tanto no detalhe de Grupos quanto no de Projetos para interação ativa e compartilhamento de avisos entre os participantes.

### 3. Lojinha Universitária (Community Marketplace)
* **Perfil do Vendedor**: Ativação condicionada ao aceite dos "Termos de Uso do Campus". Suporta personalização de Logo e Banner da loja.
* **Definição de Campus & Pontos de Encontro**: Parametrizado para os Campi de Mamanguape e Rio Tinto. Permite escolher pontos fixos (como Biblioteca, RE, RU, Laboratórios) ou cadastrar locais customizados.
* **Gestão de Produtos**: Cadastro de itens com fotos, descrição e preço. Monitoramento de visualizações e cliques.
* **WhatsApp Checkout**: Geração de mensagens estruturadas para direcionamento direto ao WhatsApp do vendedor, com dados do pedido, ponto de encontro e método de pagamento (Pix integrado).

### 4. Recomendações e Conexões (Social)
* **Depoimentos (Testimonials)**: Usuários podem enviar recomendações para os perfis de outros alunos/servidores. Requer aprovação explícita do destinatário para aparecer na aba pública do perfil.
* **Sistema de Follow**: Possibilidade de seguir e ser seguido por outros membros, gerando notificações.

### 5. Painel Administrativo, Auditoria e LGPD
* **Logs de Auditoria (Conformidade LGPD)**: Rastreamento completo de eventos sensíveis (logins, alterações de senha, downloads de dados e cadastros). Sanitização avançada para não expor segredos.
* **Moderação de Denúncias**: Usuários podem denunciar postagens ou perfis. Administradores moderam as ocorrências a partir de um painel integrado.

---

## 🚀 Como Executar o Projeto

Você pode rodar o projeto usando **Docker Compose** (recomendado para desenvolvimento rápido) ou executando os serviços **manualmente**.

### Opção 1: Usando Docker Compose (Recomendado)

Certifique-se de ter o Docker e o Docker Compose instalados.

1. Navegue até o diretório principal:
   ```bash
   cd NEXUSHUB
   ```
2. Inicie os containers com build atualizado:
   ```bash
   docker-compose up --build
   ```
3. Acesse a aplicação:
   * **Frontend (Angular):** [http://localhost:4200](http://localhost:4200)
   * **Backend (Spring Boot):** [http://localhost:8080](http://localhost:8080)

---

### Opção 2: Execução Manual

#### 1. Executando o Backend (Spring Boot)
1. Navegue até o diretório `NEXUSHUB`:
   ```bash
   cd NEXUSHUB
   ```
2. Execute o comando Spring Boot do Maven:
   ```bash
   mvn spring-boot:run -pl controller
   ```
   * O backend rodará em `http://localhost:8080`

#### 2. Executando o Frontend (Angular)
1. Navegue até a pasta `view`:
   ```bash
   cd NEXUSHUB/view
   ```
2. Instale os pacotes:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run start
   ```
   * O frontend estará disponível em `http://localhost:4200`

---

## 🧪 Como Executar os Testes

O projeto conta com testes unitários e de integração abrangentes tanto para o Backend quanto para o Frontend.

### 1. Backend (Java / JUnit 5 / Mockito)
Para rodar a suíte inteira de testes automatizados do Spring:
```bash
cd NEXUSHUB
mvn clean test
```
* **Classes de Testes Principais:**
  * [IdentityServiceImplTest.java](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/test/java/br/ufpb/dsc/nexushub/model/identity/service/IdentityServiceImplTest.java)
  * [HumanServiceImplTest.java](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/test/java/br/ufpb/dsc/nexushub/model/people/service/HumanServiceImplTest.java)
  * [FeedServiceImplTest.java](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/test/java/br/ufpb/dsc/nexushub/model/people/service/FeedServiceImplTest.java)

### 2. Frontend (Angular / Vitest)
Para rodar os testes de componentes Angular de forma não-interativa (Single Run):
```bash
cd NEXUSHUB/view
npm run test -- --watch=false
```

### 3. Cobertura de Testes (Coverage)
O projeto mantém uma das metas de qualidade mais altas, superando **93%** de cobertura de código em ambas as frentes:
* **Relatório Backend (JaCoCo):** [cobertura/backend/index.html](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/cobertura/backend/index.html)
* **Relatório Frontend (Vitest Coverage):** [cobertura/frontend/index.html](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/cobertura/frontend/index.html)

---

## 🔮 Sugestões de Melhorias Futuras

1. **Chat Interno em Tempo Real**:
   * Substituir o redirecionamento ao WhatsApp por um chat baseado em WebSockets (Spring Websockets + STOMP) diretamente na plataforma. Isso centraliza as conversas e aumenta a segurança e privacidade de compradores/vendedores.

2. **Sistema Avançado de Recompensas (Badges e Conquistas)**:
   * Conceder distintivos e medalhas ("Badges") automaticamente para usuários por marcos atingidos, como: "Primeiro post no feed", "10 depoimentos recebidos", "Vendedor Destaque" (mais de 5 vendas realizadas com sucesso na lojinha).

3. **Feed Inteligente e Recomendação de Projetos**:
   * Desenvolver um algoritmo básico de recomendação (pode ser com base nas competências cadastradas pelo estudante) para sugerir projetos de pesquisa, extensão ou grupos de estudo que buscam as tecnologias dominadas por ele.

4. **Notificações Push / E-mail Avançadas**:
   * Envio de notificações push para avisos importantes no mural dos projetos e novos depoimentos recebidos.
   * Integração de templates de e-mail responsivos em HTML (via Spring Mail + Thymeleaf) para substituição de avisos simples.

5. **Gamificação com Ranking de Pontos**:
   * Quadro de classificação geral ("Leaderboard") público exibindo os estudantes mais ativos nas comunidades, engajamento em projetos e atividades extracurriculares.

---

## 👥 Contribuintes

Este projeto foi desenvolvido com a colaboração de:

* **Gabriel Cardoso da Silva** ([silvacardoso987@gmail.com](mailto:silvacardoso987@gmail.com))
* **John Wesley Pinto** ([john.silva@dcx.ufpb.br](mailto:john.silva@dcx.ufpb.br))
* **Kássio Lima** ([kassio_leite2@hotmail.com](mailto:kassio_leite2@hotmail.com))
