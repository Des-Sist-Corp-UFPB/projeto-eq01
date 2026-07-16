# 🎓 NexusHub

> Plataforma acadêmica gamificada para centralizar projetos, grupos, eventos e oportunidades universitárias.

NexusHub conecta estudantes, professores, projetos, grupos e oportunidades em um único ambiente digital. A ideia é reduzir a perda de informações espalhadas e transformar participação acadêmica em reconhecimento por meio de pontos, rankings, conquistas e perfis acadêmicos personalizados.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza um conjunto de tecnologias modernas e robustas:

* **Backend:** Java 21, Spring Boot (REST API), Maven
* **Frontend:** Angular (TypeScript, RxJS)
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
    ├── docs           # Documentação técnica e de produto.
    └── Dockerfile & docker-compose.yml
```

### Links Rápidos dos Componentes:
* [Módulo Model](NEXUSHUB/model)
* [Módulo Controller](NEXUSHUB/controller)
* [Módulo Frontend (Angular)](NEXUSHUB/view)
* [Script de Instalação](NEXUSHUB/instalar.sh)
* [Configuração do Docker Compose](NEXUSHUB/docker-compose.yml)

---

## 🚀 Como Executar o Projeto

Você pode rodar o projeto de duas formas: usando **Docker Compose** (recomendado para desenvolvimento rápido) ou executando os serviços **manualmente**.

### Opção 1: Usando Docker Compose (Recomendado)

Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

1. Navegue até o diretório do NexusHub:
   ```bash
   cd NEXUSHUB
   ```
2. Inicie os containers do banco de dados, backend e frontend:
   ```bash
   docker-compose up --build
   ```
3. Acesse a aplicação:
   * **Frontend (Angular):** [http://localhost:4200](http://localhost:4200)
   * **Backend (Spring Boot):** [http://localhost:8080](http://localhost:8080)

---

### Opção 2: Execução Manual

#### Pré-requisitos
O projeto possui um script que automatiza a instalação de todas as dependências no Linux (Ubuntu/Debian e derivados):
* **JDK 21**
* **Apache Maven**
* **Node.js & npm**
* **PostgreSQL**

Para rodar o instalador de pré-requisitos:
```bash
cd NEXUSHUB
chmod +x instalar.sh
./instalar.sh
```

#### 1. Executando o Backend (Spring Boot)
1. Navegue até o diretório `NEXUSHUB`:
   ```bash
   cd NEXUSHUB
   ```
2. Execute o backend via Maven:
   ```bash
   mvn spring-boot:run -pl controller
   ```
   * O servidor iniciará em `http://localhost:8080`
   * Endpoints principais da API:
     * `GET /api/projetos`
     * `POST /api/projetos`
     * `GET /api/grupos`
     * `GET /api/oportunidades`

#### 2. Executando o Frontend (Angular)
1. Navegue até a pasta do frontend:
   ```bash
   cd NEXUSHUB/view
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start
   ```
   * O frontend estará disponível em `http://localhost:4200`

---

## 📄 Documentação

Para mais detalhes sobre as regras de negócio, marketing, identidade visual e planejamento de desenvolvimento, consulte a pasta de documentos:
* [Arquitetura (ARCHITECTURE.md)](NEXUSHUB/docs/ARCHITECTURE.md)
* [Produto (PRODUCT.md)](NEXUSHUB/docs/PRODUCT.md)
* [Roadmap (ROADMAP.md)](NEXUSHUB/docs/ROADMAP.md)
* [Identidade Visual (manual_identidade_visual.md)](NEXUSHUB/docs/manual_identidade_visual.md)

---

## 🛡️ Log de Auditoria

O sistema possui um módulo dedicado para registrar e monitorar ações sensíveis de usuários e operações de conformidade (LGPD).

* **O que é auditado:**
  * Registro de novo usuário (`USER_REGISTERED`)
  * Autenticação com sucesso (`LOGIN`)
  * Tentativas de autenticação falhas (`LOGIN_FAILED`)
  * Alteração de senha (`PASSWORD_CHANGED`)
  * Atualização de perfil do usuário (`PROFILE_UPDATED`)
  * Operações de privacidade e conformidade de dados pessoais (LGPD), como requisição ou exclusão de dados.
* **Onde fica armazenado:**
  * Tabela **`adm_audit`** no banco PostgreSQL.
  * **Principais campos:**
    * `idaudit` (UUID): Identificador único do log.
    * `idactor` (UUID): Identificador do usuário que realizou a ação (referencia `sec_user`).
    * `cdaction` (VARCHAR): Ação realizada.
    * `nmentity` (VARCHAR): Entidade auditada.
    * `identity` (VARCHAR): ID do registro associado.
    * `dsresult` (VARCHAR): Resultado da ação (`SUCCESS`, `DENIED`, etc.).
    * `dsip` (VARCHAR): Endereço IP do cliente.
    * `cdcorrelation` (VARCHAR): ID de correlação para rastreamento de chamadas.
    * `dsbefore` / `dsafter` (TEXT): Estado anterior e posterior dos dados, devidamente sanitizados para mascarar senhas e tokens confidenciais.
    * `tscreated` (TIMESTAMP): Data e hora do registro.
* **Como foi implementado:**
  * Implementado através de um serviço Spring dedicado (`AuditService`) que é injetado e acionado explicitamente nos controladores REST (`UsuarioRestController` e `PrivacyRestController`) nas rotas de operações sensíveis.
* **Classes e arquivos participantes:**
  * Entidade JPA: [AuditLog.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/administration/domain/AuditLog.java)
  * Repositório Spring Data: [AuditLogRepository.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/administration/repository/AuditLogRepository.java)
  * Serviço de Auditoria: [AuditService.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/administration/service/AuditService.java)
  * Controladores de Registro e Login: [UsuarioRestController.java](NEXUSHUB/controller/src/main/java/br/ufpb/dsc/nexushub/controller/UsuarioRestController.java)
  * Controlador de Privacidade: [PrivacyRestController.java](NEXUSHUB/controller/src/main/java/br/ufpb/dsc/nexushub/controller/PrivacyRestController.java)
  * Script de Migração do Banco: [V3__compliance_administration_payments.sql](NEXUSHUB/controller/src/main/resources/db/migration/V3__compliance_administration_payments.sql)

---

## 🔌 Integração com Serviço Externo

O NexusHub integra-se com a API de pagamentos do **Mercado Pago** para possibilitar compras de itens na loja acadêmica e apoiar projetos da comunidade.

* **Serviço externo:** Mercado Pago (Payment Gateway).
* **Para que é usado:** Processamento seguro de pagamentos de produtos da loja da comunidade universitária, lidando com a criação de preferências de checkout e verificação de pagamentos recebidos via webhook.
* **Como é configurado (Variáveis de ambiente):**
  * `APP_PAYMENT_FAKE`: Flag boolean (`true` ou `false`) para simular os pagamentos localmente em ambiente de desenvolvimento sem chamar as APIs reais.
  * `MERCADO_PAGO_ACCESS_TOKEN`: Token de acesso pessoal (PAT) do Mercado Pago para autorização das requisições na API REST.
  * `MERCADO_PAGO_WEBHOOK_SECRET`: Chave secreta de autenticação do webhook para validação das notificações recebidas.
  * `MERCADO_PAGO_BASE_URL`: URL base das APIs do Mercado Pago (default: `https://api.mercadopago.com`).
* **Classes e arquivos participantes:**
  * Abstração do Gateway: [PaymentGateway.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/payments/service/PaymentGateway.java)
  * Implementação da API do Mercado Pago: [MercadoPagoGateway.java](NEXUSHUB/controller/src/main/java/br/ufpb/dsc/nexushub/controller/payments/MercadoPagoGateway.java)
  * Serviço de Negócio de Pagamento: [PaymentService.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/payments/service/PaymentService.java)
  * Entidade de Transações: [PaymentOrder.java](NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/payments/domain/PaymentOrder.java)
  * Arquivo de propriedades: [application.yml](NEXUSHUB/controller/src/main/resources/application.yml)

---

## 📊 Cobertura de Testes

Os relatórios de cobertura de testes automatizados foram gerados para ambos os módulos e encontram-se commitados no repositório:

* **Módulo Backend (Java):** **93.08%** de linhas cobertas (JaCoCo).
  * Relatório em: [cobertura/backend/index.html](cobertura/backend/index.html)
* **Módulo Frontend (Angular/Vitest):** **93.91%** de linhas cobertas (v8).
  * Relatório em: [cobertura/frontend/index.html](cobertura/frontend/index.html)

---

## 👥 Contribuintes

Este projeto foi desenvolvido com a colaboração de:

* **Gabriel Cardoso da Silva** ([silvacardoso987@gmail.com](mailto:silvacardoso987@gmail.com))
* **John Wesley Pinto** ([john.silva@dcx.ufpb.br](mailto:john.silva@dcx.ufpb.br))
* **Kássio Lima** ([kassio_leite2@hotmail.com](mailto:kassio_leite2@hotmail.com))
