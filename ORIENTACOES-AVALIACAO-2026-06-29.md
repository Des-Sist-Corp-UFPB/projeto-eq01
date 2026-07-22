# Orientações para Avaliação Final — 2026-06-29

**Prazo de entrega: 30/06/2026.**

A avaliação será realizada a partir do que estiver disponível no repositório do
projeto. Para que seu trabalho seja corretamente reconhecido, siga as instruções
deste documento. Itens não documentados/comprovados no repositório serão
considerados **não atendidos**.

Requisitos avaliados:

1. Módulo de **Log de Auditoria**
2. **Integração com serviço externo**
3. **Cobertura de testes automatizados ≥ 85%**

---

## 1. Cobertura de testes (≥ 85%)

É necessário **gerar e commitar no Git o relatório de cobertura**. Não basta ter
testes — é preciso comprovar o percentual no repositório.

Passos:

1. Gere o relatório conforme sua stack (veja abaixo).
2. Copie o relatório gerado para uma pasta **`cobertura/`** na raiz do projeto.
3. Faça commit e push dessa pasta (atenção: `target/`, `coverage/`, `htmlcov/`
   costumam estar no `.gitignore` — por isso copie para a pasta `cobertura/`).
4. No README, informe o **percentual total** e o caminho do relatório.

> **Dica:** você pode pedir à IA que estiver usando no projeto para executar a
> cobertura automaticamente. Há um prompt pronto na seção
> ["Prompt para gerar a cobertura com IA"](#prompt-para-gerar-a-cobertura-com-ia)
> ao final deste documento.

### Java / Maven (JaCoCo)
```bash
mvn clean test jacoco:report
cp -r target/site/jacoco cobertura/
```
O percentual fica em `cobertura/jacoco/index.html` (e em `jacoco.csv`).
Se ainda não tem o JaCoCo no `pom.xml`, adicione o `jacoco-maven-plugin` com a
meta `report` ligada à fase `test`.

### Node / TypeScript (Vitest ou Jest)
```bash
# Vitest
npx vitest run --coverage
# Jest
npx jest --coverage
cp -r coverage cobertura/
```
O percentual fica em `cobertura/coverage/index.html` (ou `lcov-report/`).

### Python (pytest-cov)
```bash
pytest --cov=. --cov-report=html --cov-report=term
cp -r htmlcov cobertura/
```
O percentual fica em `cobertura/htmlcov/index.html`.

> Projetos com **front e back separados** devem gerar e commitar **um relatório
> de cada módulo** (ex.: `cobertura/backend/` e `cobertura/frontend/`).

---

## 2. Log de Auditoria — documentar no `README.md`

Adicione uma seção **"## Log de Auditoria"** no README explicando:

- **O que é auditado** (quais ações de usuário: login, criação/edição/exclusão etc.)
- **Onde fica armazenado** (tabela/coleção — nome e principais campos)
- **Como foi implementado** (filtro, interceptor, AOP, listener, service dedicado)
- **Quais classes/arquivos participam** (liste com o caminho, ex.:
  `src/.../audit/AuditLogService.java`, `AuditInterceptor.java`)

Dessa forma a avaliação cruza sua descrição com o código.

---

## 3. Integração com Serviço Externo — documentar no `README.md`

Adicione uma seção **"## Integração com Serviço Externo"** no README explicando:

- **Qual é o serviço externo** (ex.: Mercado Pago, Resend, SendGrid, AWS S3,
  MinIO, OpenAI, etc.)
- **Para que é usado** no sistema
- **Quais classes/arquivos participam** da integração (liste com o caminho)
- **Como é configurado** (variáveis de ambiente usadas — **sem expor segredos**)

> Atenção: o **PostgreSQL** fornecido pela disciplina **não conta** como
> integração externa — é infraestrutura básica do projeto.

---

## Checklist final

```
[ ] Pasta cobertura/ commitada, com percentual total ≥ 85% visível
[ ] README com seção "Log de Auditoria" (o quê, onde, como, quais classes)
[ ] README com seção "Integração com Serviço Externo" (qual, classes, config)
[ ] Push feito na branch main até 30/06/2026
```

---

## Prompt para gerar a cobertura com IA

Copie o texto abaixo e cole na IA que você usa no projeto (Claude Code, Copilot,
Cursor, etc.), com o projeto aberto. Ela vai detectar a stack e gerar o relatório.

```text
Preciso gerar e commitar o relatório de cobertura de testes deste projeto para
avaliação. Faça o seguinte:

1. Detecte a(s) stack(s) do projeto inspecionando os arquivos de build presentes:
   - pom.xml ou build.gradle  → Java (use JaCoCo)
   - package.json             → Node/TypeScript (use Vitest ou Jest, o que o
                                 projeto já usar)
   - requirements.txt / pyproject.toml → Python (use pytest com pytest-cov)
   Se o projeto tiver mais de um módulo (ex.: backend e frontend em pastas
   separadas), repita o processo para cada um.

2. Garanta que a ferramenta de cobertura esteja configurada:
   - Java: se não houver o jacoco-maven-plugin no pom.xml, adicione-o com a meta
     "report" ligada à fase "test".
   - Node: se não houver provider de cobertura, instale o necessário
     (ex.: @vitest/coverage-v8 para Vitest, ou use jest --coverage).
   - Python: se pytest-cov não estiver instalado, instale-o.

3. Execute os testes COM cobertura e gere o relatório em HTML:
   - Java:   mvn clean test jacoco:report   (saída em target/site/jacoco/)
   - Vitest: npx vitest run --coverage       (saída em coverage/)
   - Jest:   npx jest --coverage             (saída em coverage/)
   - Python: pytest --cov=. --cov-report=html --cov-report=term  (saída em htmlcov/)

4. Copie o relatório gerado para uma pasta chamada "cobertura/" na raiz do
   projeto. Se houver mais de um módulo, use subpastas:
   cobertura/backend/ e cobertura/frontend/.

5. Me informe o PERCENTUAL TOTAL de cobertura de linhas obtido. Se estiver
   abaixo de 85%, liste as classes/arquivos com menor cobertura e sugira quais
   testes faltam para chegar a 85%.

6. Garanta que a pasta cobertura/ NÃO esteja no .gitignore. Em seguida, faça:
   git add cobertura/ && git commit -m "test: relatório de cobertura para avaliação"
   git push origin main

Não exponha segredos nem variáveis sensíveis no relatório nem nos commits.
```

---

*Documento gerado em 2026-06-29. Avaliação por Prof. Rodrigo.*
