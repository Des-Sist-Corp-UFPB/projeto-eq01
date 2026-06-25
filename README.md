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
    ├── view-angular   # Aplicação Angular (interface com usuário).
    ├── docs           # Documentação técnica e de produto.
    └── Dockerfile & docker-compose.yml
```

### Links Rápidos dos Componentes:
* [Módulo Model](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/model)
* [Módulo Controller](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/controller)
* [Módulo Frontend (Angular)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/view-angular)
* [Script de Instalação](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/instalar.sh)
* [Configuração do Docker Compose](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/docker-compose.yml)

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
   cd NEXUSHUB/view-angular
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
* [Arquitetura (ARCHITECTURE.md)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/docs/ARCHITECTURE.md)
* [Produto (PRODUCT.md)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/docs/PRODUCT.md)
* [Roadmap (ROADMAP.md)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/docs/ROADMAP.md)
* [Identidade Visual (manual_identidade_visual.md)](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/NexusHub/projeto-eq01/NEXUSHUB/docs/manual_identidade_visual.md)

---

## 👥 Contribuintes

Este projeto foi desenvolvido com a colaboração de:

* **Gabriel Cardoso da Silva** ([silvacardoso987@gmail.com](mailto:silvacardoso987@gmail.com))
* **John Wesley Pinto** ([john.silva@dcx.ufpb.br](mailto:john.silva@dcx.ufpb.br))
* **Kássio Lima** ([kassio_leite2@hotmail.com](mailto:kassio_leite2@hotmail.com))
