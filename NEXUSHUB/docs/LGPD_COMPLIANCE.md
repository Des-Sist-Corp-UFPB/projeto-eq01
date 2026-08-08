# 🔒 Conformidade LGPD & Política de Privacidade - NexusHub

O **NexusHub** foi desenvolvido em estrita conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)**, garantindo transparência, consentimento explícito, privacidade por padrão e controle completo dos titulares sobre seus dados pessoais acadêmicos.

---

## 🏛️ 1. Princípios de Privacidade Aplicados

1. **Consentimento Livre e Explicito (Art. 7º, I)**:
   - Nenhum cadastro de usuário (via formulário local ou Google OAuth 2.0) é finalizado sem o aceite ativo do termo de consentimento LGPD.
   - O registro do consentimento armazena o ID do usuário, a finalidade (`TERMS_AND_PRIVACY`), a versão dos termos (`1.0`) e o timestamp.

2. **Direito de Acesso e Portabilidade de Dados (Art. 18, V e V)**:
   - A API disponibiliza o endpoint `/api/lgpd/meus-dados`, permitindo ao titular realizar o download completo (exportação em JSON) de todas as suas informações cadastradas (perfil, depoimentos, permissões e histórico de solicitações).

3. **Direito de Revogação e Solicitação de Exclusão (Art. 18, VI e IX)**:
   - O usuário pode registrar solicitações formais de revogação de consentimento ou exclusão de dados pelo endpoint `/api/lgpd/solicitacoes`.

4. **Minimização e Sanitização de Dados (Art. 6º, III)**:
   - Dados sensíveis e credenciais de acesso (senhas, tokens Bearer, senhas temporárias) passam por filtro de sanitização (`AuditLog.sanitize()`) antes de serem armazenados nos logs de auditoria, convertendo valores em `[REDACTED]`.

5. **Privacidade por Padrão (Privacy by Default)**:
   - A data de nascimento dos estudantes vem por padrão oculta no perfil público, podendo ser exibida apenas se o usuário ativar explicitamente a opção `showBirthday`.

---

## 🛠️ 2. Arquitetura Técnica do Módulo de Privacidade

### Backend (Spring Boot / Java)

* **Entidade Consent**: [`NEXUSHUB/model/.../privacy/domain/Consent.java`](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/privacy/domain/Consent.java)
  - Mapeia os consentimentos fornecidos pelo titular no banco de dados na tabela `prv_consent`.
* **Entidade DataSubjectRequest**: [`NEXUSHUB/model/.../privacy/domain/DataSubjectRequest.java`](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/privacy/domain/DataSubjectRequest.java)
  - Registra requisições formais dos titulares (exclusão, retificação, portabilidade) na tabela `prv_request`.
* **Serviço de Privacidade**: [`NEXUSHUB/model/.../privacy/service/PrivacyService.java`](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/model/src/main/java/br/ufpb/dsc/nexushub/model/privacy/service/PrivacyService.java)
  - Controla a lógica de registro de consentimento, abertura de chamados LGPD e compilação do relatório exportável de dados.
* **REST Controller**: [`NEXUSHUB/controller/.../PrivacyRestController.java`](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/controller/src/main/java/br/ufpb/dsc/nexushub/controller/PrivacyRestController.java)
  - Expõe os endpoints protegidos `/api/lgpd/consentimentos`, `/api/lgpd/solicitacoes` e `/api/lgpd/meus-dados`.

---

## 🌐 3. Interface Visual e Direitos do Usuário (Frontend)

O frontend em Angular conta com a página exclusiva de Privacidade:
- **Página pública de Privacidade**: `/privacidade` ([`privacy.page.ts`](file:///home/john/Desktop/ESTUDO_PESSOAL/DSC%20Rodrigo/AytyHub/AytyHub/NEXUSHUB/view/src/app/features/privacy/pages/privacy/privacy.page.ts))
- Permite aos estudantes visualizar a política completa do campus, consultar seus consentimentos ativos, solicitar o download em JSON dos seus dados e revogar permissões.
