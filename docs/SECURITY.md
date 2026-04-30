# Segurança do Projeto

## Ferramentas de SAST (Static Application Security Testing)

### SpotBugs + FindSecBugs
Analisa o **bytecode Java compilado** buscando padrões de vulnerabilidade.

```bash
# Rodar análise
mvn verify -Psecurity

# Ver relatório HTML
open target/spotbugsXml.html
```

**O que detecta**: SQL Injection, XXE, Path Traversal, uso inseguro de criptografia, etc.

**Supressões**: Edite `spotbugs-exclude.xml` — documente sempre o motivo.

### Semgrep
Analisa o **código-fonte** com regras baseadas em padrões.

```bash
# Instalar (macOS)
brew install semgrep

# Rodar com regras automáticas para Java/Spring
semgrep --config=auto src/

# Rodar apenas regras de segurança
semgrep --config=p/java src/ --severity WARNING
```

**Por que usar além do SpotBugs?** SpotBugs analisa bytecode (pós-compilação); Semgrep analisa código-fonte (pré-compilação). São complementares.

### Trivy

```bash
# Scan do filesystem (dependências, segredos vazados)
docker compose -f docker/docker-compose.dev.yml --profile scan up trivy

# Scan da imagem Docker de produção
docker build -f docker/Dockerfile -t mercado:latest .
docker run --rm aquasec/trivy image mercado:latest --severity HIGH,CRITICAL
```

## OWASP Dependency-Check

Verifica CVEs (vulnerabilidades conhecidas) nas dependências do projeto.

```bash
mvn verify -Psecurity
# Relatório em: target/dependency-check-report.html
```

**Threshold**: Build falha para CVSS ≥ 7.0 (High/Critical).

**Supressões**: Edite `owasp-suppressions.xml` com justificativa documentada.

## Verificar Dependências Desatualizadas

```bash
mvn versions:display-dependency-updates -Pversions
```

## Top 10 OWASP — Proteções no Projeto

| Risco | Proteção Implementada |
|---|---|
| A01: Broken Access Control | Spring Security — todo endpoint requer autenticação |
| A02: Cryptographic Failures | BCrypt para senhas |
| A03: Injection | JPA com parâmetros nomeados (sem SQL concatenado) |
| A05: Security Misconfiguration | Headers de segurança via Spring Security defaults |
| A07: Auth Failures | Spring Security form login com CSRF |
| A08: Software Integrity | Flyway migrations com checksums |
| A09: Logging Failures | Spring Boot Actuator + logging configurado |

## Configuração de Segurança do Spring

Ver `SecurityConfig.java`:
- CSRF habilitado (desabilitado apenas para endpoints HTMX)
- Usuário em memória para desenvolvimento (trocar em produção)
- BCrypt como algoritmo de hash de senhas
- Toda URL protegida exceto `/login` e recursos estáticos
