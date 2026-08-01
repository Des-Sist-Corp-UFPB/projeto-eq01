# 🧪 Pasta de Testes de Métodos do NexusHub

Esta pasta (`NEXUSHUB/testes_metodos/`) contém a suíte completa de testes automatizados focada em validar o funcionamento dos **métodos do sistema** e garantir que cada função retorne exatamente o que foi especificado.

---

## 📂 Organização das Pastas e Módulos

```text
NEXUSHUB/testes_metodos/
├── 01_autenticacao_e_identidade/
│   └── IdentityServiceMetodosTest.java       # Testa registro, login, senhas e onboarding
├── 02_pessoas_e_rede_social/
│   └── FeedAndHumanServiceMetodosTest.java   # Testa posts, curtidas, comentários e perfil
├── 03_projetos/
│   └── ProjectServiceMetodosTest.java        # Testa criação de projetos, vagas e membros
├── 04_grupos/
│   └── GroupServiceMetodosTest.java          # Testa laboratórios, grupos e liderança
├── 05_oportunidades/
│   └── OpportunityServiceMetodosTest.java    # Testa editais, bolsas e candidaturas
├── 06_loja_e_pagamentos/
│   └── ShopAndPaymentMetodosTest.java        # Testa checkout, produtos e pagamentos
├── 07_administracao_e_moderacao/
│   └── ModerationAndAdminMetodosTest.java    # Testa denúncias, feature flags e auditoria
├── executar_testes.bat                        # Script de execução no Windows
└── executar_testes.sh                         # Script de execução no Linux/macOS
```

---

## 🚀 Como Executar os Testes de Métodos

### No Windows:
Basta dar dois cliques no arquivo `executar_testes.bat` ou rodar no terminal:
```cmd
cd NEXUSHUB\testes_metodos
executar_testes.bat
```

### No Linux/macOS ou Terminal Bash:
```bash
cd NEXUSHUB/testes_metodos
chmod +x executar_testes.sh
./executar_testes.sh
```

---

## 📋 Métodos Testados e O que é Validado

| Classe de Teste | Métodos Testados | Validações Efetuadas |
| :--- | :--- | :--- |
| `IdentityServiceMetodosTest` | `registerUser`, `authenticate`, `completeOnboarding` | Normalização de e-mail, geração de hash de senha, tratamento de e-mail duplicado e retorno de `Optional<User>`. |
| `FeedAndHumanServiceMetodosTest` | `createPost`, `toggleLike` | Criação de postagem, associação de autor, exceção para autor inexistente e alteração de estado de curtidas. |
| `ProjectServiceMetodosTest` | `createProject`, `findActiveProjectById` | Associação com grupo obrigatório, atribuição do líder e busca por status ativo. |
| `GroupServiceMetodosTest` | `createGroup`, `getGroup`, `listActiveGroups` | Cadastro de laboratório/grupo, sigla, exceção para ID inválido e filtragem de status ativo. |
| `OpportunityServiceMetodosTest` | `create`, `apply` | Criação de editais de bolsa e verificação de candidatura de estudante. |
| `ShopAndPaymentMetodosTest` | `checkout` | Checkout de pagamento, verificação de idempotência e trava por feature flag. |
| `ModerationAndAdminMetodosTest` | `enabled`, `log` | Leitura de feature flags ativas/inativas e gravação de logs de auditoria. |
