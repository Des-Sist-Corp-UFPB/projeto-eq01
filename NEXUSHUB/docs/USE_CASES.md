# Casos de Uso e Lacunas do Produto

Este documento consolida a ideia original do NEXUS HUB, o que ja aparece no codigo atual e o que falta modelar antes da refatoracao de arquitetura e banco de dados.

## Leitura do produto

O NEXUS HUB nasce como uma plataforma academica gamificada para centralizar projetos, grupos, eventos, oportunidades e reconhecimento academico. A dor principal descrita nos documentos e a dispersao de informacoes dentro da universidade: projetos, vagas, eventos e chamadas ficam espalhados em grupos de mensagens, redes sociais, murais fisicos e comunicados isolados.

A proposta de valor e juntar tres movimentos:

- Descoberta: estudantes encontram projetos, grupos, eventos e oportunidades.
- Participacao: estudantes solicitam entrada, entram em grupos, candidatam-se a vagas e acompanham iniciativas.
- Reconhecimento: participacao gera historico, pontos, conquistas, ranking e perfil academico.

## Estado atual observado

### Implementado no backend

- Cadastro, login, edicao de perfil e redefinicao direta de senha.
- Cadastro e consulta de projetos.
- Listagens especiais de projetos: quentes, recentes, colaboracoes e filtro por tag ou autor.
- Cadastro, listagem, detalhe e exclusao de grupos.
- Listagem simples de oportunidades.
- Solicitacao de entrada em projeto, listagem por projeto e resposta de aprovacao/rejeicao.
- Seeds de desenvolvimento para usuarios, grupos, oportunidades e projetos.

### Implementado ou prototipado no frontend Angular

- Dashboard com busca, carrosseis e criacao de projeto.
- Login, cadastro, esqueci senha e perfil.
- Detalhe de projeto com solicitacao de entrada e painel do dono.
- Paginas de grupos, criacao de grupo e detalhe de grupo.
- Participacao em grupo, membros do grupo, vagas internas e candidaturas simuladas via `localStorage`.

### Pontos importantes para refatoracao

- A view oficial do projeto e `view`.
- Varias regras de dominio estao no frontend ou em mocks locais, especialmente membros de grupo, vagas e candidaturas.
- Relacionamentos importantes estao salvos como texto: `Projeto.autor`, `Projeto.grupoPertencente`, `SolicitacaoEntrada.usuarioEmail`.
- A autorizacao ainda e implicita na interface, nao no backend. Exemplo: dono do projeto e detectado por comparacao de nome.
- A gamificacao existe como conceito visual e campos soltos, mas nao como modelo de dominio.

## Atores

- Visitante: pessoa nao autenticada que explora conteudo publico.
- Estudante: usuario cadastrado que busca participar de projetos, grupos, eventos e oportunidades.
- Professor/Orientador: usuario que cria projetos, coordena iniciativas e avalia solicitacoes.
- Coordenador de grupo: usuario responsavel por grupo, membros, projetos e vagas do grupo.
- Administrador/Sysadmin: usuario com poderes de moderacao, gestao e relatorios.
- Parceiro externo: ator futuro para publicar oportunidades externas ou participar de grupos externos.

## Casos de uso principais

### UC01 - Cadastrar usuario

Ator principal: Visitante.

Objetivo: criar uma conta academica no NEXUS HUB.

Fluxo principal:

1. Visitante informa nome, e-mail, cargo e senha.
2. Sistema normaliza o e-mail.
3. Sistema verifica se o e-mail ja existe.
4. Sistema salva usuario com senha criptografada.
5. Sistema retorna os dados publicos do usuario.

Regras atuais:

- E-mail deve ser unico.
- Senha e salva com BCrypt.
- Cargo padrao no backend e `ESTUDANTE` quando nao informado.

Lacunas:

- Falta validacao de dominio institucional, se for requisito.
- Falta confirmacao de e-mail.
- Falta politica formal de papeis/perfis.
- Falta token de sessao/JWT; o login atual retorna dados do usuario.

Entidades envolvidas:

- `Usuario`
- Futuro: `PerfilAcademico`, `Papel`, `Sessao` ou `RefreshToken`

### UC02 - Autenticar usuario

Ator principal: Usuario cadastrado.

Objetivo: acessar a plataforma com e-mail e senha.

Fluxo principal:

1. Usuario informa e-mail e senha.
2. Sistema normaliza e-mail.
3. Sistema busca usuario por e-mail.
4. Sistema compara senha com hash.
5. Sistema retorna dados publicos do usuario.

Regras atuais:

- Mensagem generica para e-mail/senha incorretos.
- Nao ha token de autenticacao persistente no backend.

Lacunas:

- Implementar autenticacao stateless ou sessao segura.
- Definir expiracao, refresh, logout e autorizacao por papel.
- Bloquear acoes sensiveis no backend, nao apenas na UI.

### UC03 - Recuperar ou redefinir senha

Ator principal: Usuario cadastrado.

Objetivo: redefinir a senha quando perdeu o acesso.

Fluxo atual:

1. Usuario informa e-mail e nova senha.
2. Sistema busca usuario.
3. Sistema troca a senha diretamente.

Lacunas criticas:

- O fluxo atual nao e seguro para producao.
- Falta token temporario de recuperacao.
- Falta envio de e-mail.
- Falta expiracao e invalidacao de token.

Proposta:

- Criar `PasswordResetToken` com usuario, token hash, expiracao, uso em uma unica vez e auditoria.

### UC04 - Editar perfil academico

Ator principal: Usuario autenticado.

Objetivo: manter dados pessoais e academicos atualizados.

Fluxo principal:

1. Usuario abre o perfil.
2. Sistema exibe nome, e-mail, cargo e metricas.
3. Usuario altera dados.
4. Sistema valida e-mail unico.
5. Sistema salva alteracoes.

Regras atuais:

- Edição organizada por **6 Tópicos** (Pessoais, Acadêmicos, Competências, Histórico, Contatos e Configurações).
- Sugestão inteligente de competências por curso do Campus IV (Rio Tinto e Mamanguape) em chips com adição em 1 clique.
- Estilização moderna de chips/tags de competência adicionadas com botão circular de exclusão.
- Upload de foto do dispositivo com auto-crop 1:1, compressão automática (300x300 px / 150 KB) e pré-visualização ao vivo (*Live Preview*).
- Verificação de disponibilidade de `@username` único em tempo real com badges visuais (Disponível, Em uso, Verificando, Atual).
- Nome, e-mail, cargo, bio, redes sociais e privacidade configuráveis.

Implementado recentemente:

- Perfil integrado ao modelo `User` / `Human` / `Technology`.
- Dicionário de competências por curso do Campus IV.
- Verificação em tempo real de username no endpoint `/api/usuarios/username/{username}`.

### UC05 - Explorar catalogo de projetos

Ator principal: Visitante ou usuario autenticado.

Objetivo: descobrir iniciativas academicas.

Fluxo principal:

1. Usuario acessa dashboard.
2. Sistema lista projetos gerais.
3. Usuario busca por nome, resumo, tags ou autor.
4. Usuario navega por secoes: mais quentes, recentes, colaboracoes e tags.

Regras atuais:

- "Quentes" ordena por `xpDistribuido`.
- "Recentes" ordena por `criadoEm`.
- "Colabs" filtra projetos de Pesquisa ou Extensao.
- Busca geral da tela e feita no frontend.
- Filtro por tag no backend usa busca textual em string separada por virgula.

Lacunas:

- Definir criterios reais de ranking: curtidas, membros, visualizacoes, atividade, prazo, XP.
- Criar entidade `Tag` e relacionamento N:N com projeto.
- Criar filtros por area, tipo, status, grupo, periodo e visibilidade.
- Criar paginacao e ordenacao no backend.

### UC06 - Criar projeto

Ator principal: Professor, coordenador ou usuario autenticado autorizado.

Objetivo: publicar uma iniciativa academica.

Fluxo principal:

1. Usuario autenticado abre modal de criacao.
2. Informa dados basicos, grupo, visibilidade e imagens.
3. Sistema cria projeto com status inicial aberto.
4. Projeto aparece no catalogo.

Regras atuais:

- Backend inicializa curtidas em 0 e membros em 1.
- Status default e `ABERTO`.
- Autor e enviado como texto.
- Frontend usa autor padrao `Rodrigo Silva` no modal, nao o usuario logado.

Lacunas criticas:

- Vincular projeto ao `Usuario` criador por FK.
- Vincular projeto ao `Grupo` por FK.
- Validar permissao para criar projeto em um grupo.
- Definir estados: rascunho, publicado, aberto, fechado, arquivado, em moderacao.
- Separar `categoria`, `tipo`, `area` e `modalidade`, hoje com sobreposicoes.
- Modelar imagens/anexos em entidade propria ou estrategia de storage.

### UC07 - Ver detalhe de projeto

Ator principal: Visitante ou usuario autenticado.

Objetivo: entender uma iniciativa e decidir participar.

Fluxo principal:

1. Usuario abre projeto.
2. Sistema mostra capa, resumo, objetivos, tags, autor, grupo, membros, status e XP.
3. Se usuario for dono, sistema exibe solicitacoes.
4. Se usuario nao for dono e projeto estiver aberto, sistema exibe formulario de entrada.

Regras atuais:

- Dono e definido por `projeto.autor == usuario.nome`.
- Solicitacoes sao carregadas apenas para o dono na tela.
- Projeto privado ainda pode ser consultado se a API permitir.

Lacunas:

- Autoridade deve ser baseada em usuario/grupo/papel, nao nome.
- Visibilidade precisa ser aplicada no backend.
- Faltam membros reais do projeto.
- Faltam comentarios, atualizacoes, entregas, arquivos ou historico.

### UC08 - Solicitar entrada em projeto

Ator principal: Estudante autenticado.

Objetivo: pedir participacao em projeto aberto.

Fluxo principal:

1. Estudante abre projeto.
2. Informa justificativa/motivo.
3. Sistema verifica se ja existe solicitacao pendente para o mesmo projeto e e-mail.
4. Sistema cria solicitacao com status `PENDENTE`.
5. Sistema confirma envio.

Regras atuais:

- Impede duplicidade apenas entre solicitacoes pendentes.
- Salva `projetoId`, `projetoNome`, `usuarioEmail`, `usuarioNome` e `motivo`.

Lacunas:

- Vincular solicitacao a `Projeto` e `Usuario` por FK.
- Impedir nova solicitacao se usuario ja for membro.
- Definir se rejeicao permite nova tentativa.
- Registrar data de resposta, avaliador e justificativa da decisao.
- Notificar o responsavel e o solicitante.

### UC09 - Avaliar solicitacao de entrada

Ator principal: Dono do projeto, professor ou coordenador autorizado.

Objetivo: aprovar ou rejeitar entrada de estudante no projeto.

Fluxo principal:

1. Responsavel abre detalhe do projeto.
2. Sistema lista solicitacoes.
3. Responsavel aprova ou rejeita cada solicitacao pendente.
4. Sistema atualiza status.
5. Se aprovado, sistema incrementa quantidade de membros do projeto.

Regras atuais:

- Solicitacao ja respondida nao pode ser modificada.
- Aprovacao incrementa contador numerico, mas nao cria membro real.

Lacunas criticas:

- Criar entidade `ProjetoMembro`.
- A aprovacao deve criar membro com papel, status e data de entrada.
- Quantidade de membros deve ser derivada ou sincronizada com cuidado.
- Falta autorizacao no backend para garantir que so responsavel avalie.

### UC10 - Explorar grupos

Ator principal: Visitante ou usuario autenticado.

Objetivo: encontrar laboratorios, comunidades, nucleos e parceiros.

Fluxo principal:

1. Usuario acessa pagina de grupos.
2. Sistema lista grupos.
3. Usuario busca por nome ou descricao.
4. Sistema organiza por area/categoria.
5. Usuario abre detalhe do grupo.

Regras atuais:

- Areas principais no frontend: Institucional, Comunidade e Externo.
- Projetos associados sao buscados por comparacao textual com `grupoPertencente`.

Lacunas:

- Relacionar `Projeto` e `Grupo` por FK.
- Criar filtros e paginacao.
- Definir taxonomia de grupos.
- Definir visibilidade de grupos restritos.

### UC11 - Criar grupo

Ator principal: Professor, coordenador, administrador ou usuario autorizado.

Objetivo: registrar um grupo academico ou comunidade.

Fluxo principal:

1. Usuario abre formulario de grupo.
2. Informa nome, area, tipo, descricao, imagem, cor e responsavel.
3. Sistema salva e publica grupo.

Regras atuais:

- Qualquer usuario pela UI pode abrir criacao.
- Responsavel e o usuario logado, ou `John Wesley` como fallback.
- Backend aceita a entidade diretamente.

Lacunas:

- Definir quem pode criar grupos.
- Validar unicidade de nome quando necessario.
- Vincular responsavel a `Usuario`.
- Modelar imagem de capa/logo.
- Criar fluxo de aprovacao/moderacao para grupos institucionais.

### UC12 - Participar de grupo

Ator principal: Estudante autenticado.

Objetivo: entrar ou sair de um grupo.

Fluxo prototipado:

1. Usuario abre detalhe do grupo.
2. Se nao for coordenador e nao for membro, clica em participar.
3. Frontend adiciona membro no `localStorage`.
4. Usuario pode sair, exceto se for coordenador.

Regras atuais:

- Nao ha persistencia no backend.
- Grupos restritos nao tem fluxo de aprovacao real.

Lacunas criticas:

- Criar entidade `GrupoMembro`.
- Definir entrada direta para grupo aberto e solicitacao para grupo restrito.
- Definir papeis: coordenador, professor, membro, convidado, parceiro.
- Persistir saida, remocao, bloqueio e historico.

### UC13 - Gerenciar vagas/oportunidades de grupo

Ator principal: Coordenador de grupo.

Objetivo: publicar vagas internas do grupo e acompanhar candidatos.

Fluxo prototipado:

1. Coordenador abre detalhe do grupo.
2. Cria vaga com cargo, tipo e requisitos.
3. Vaga aparece no mural do grupo.
4. Membros/usuarios se candidatam.
5. Coordenador visualiza candidatos.

Regras atuais:

- Toda persistencia e feita em `localStorage`.
- Nao ha API de vagas de grupo.

Lacunas:

- Unificar ou separar `Oportunidade` geral e `VagaGrupo`.
- Criar candidatura persistente.
- Definir status da oportunidade: aberta, encerrada, pausada, preenchida.
- Definir prazos, quantidade de vagas, requisitos, beneficios, contato e link externo.

### UC14 - Explorar mural de oportunidades

Ator principal: Estudante ou visitante.

Objetivo: encontrar bolsas, estagios, monitorias, voluntariado e chamadas.

Fluxo atual:

1. Sistema oferece API de listagem de oportunidades.
2. Dados seedados exibem uma oportunidade simples.

Lacunas:

- Falta tela dedicada robusta.
- Falta criacao/edicao/exclusao de oportunidades.
- Falta candidatura ou link externo.
- Falta filtros por tipo, prazo, area, status e grupo/projeto associado.
- Falta notificacao de prazo.

### UC15 - Participar de evento academico

Ator principal: Estudante, professor ou visitante.

Objetivo: descobrir eventos e se inscrever.

Estado atual:

- Eventos existem na ideia original e roadmap, mas nao aparecem como entidade, API ou tela implementada.

Lacunas:

- Criar entidade `Evento`.
- Definir inscricao, presenca, certificado e pontuacao.
- Permitir vinculo com grupo, projeto ou organizador.
- Criar calendario e filtros por data, local, area e modalidade.

### UC16 - Receber pontos e conquistas

Ator principal: Estudante.

Objetivo: transformar participacao academica em reconhecimento.

Estado atual:

- Produto e marca falam de pontos, XP, badges e rankings.
- Projeto possui `xpDistribuido` e `pontos`.
- Perfil exibe metricas fixas, nao calculadas.

Lacunas criticas:

- Definir eventos que geram pontos.
- Criar extrato de pontuacao.
- Criar badges/conquistas.
- Criar niveis e ranking.
- Definir regras anti-abuso e moderacao.

Proposta de eventos pontuaveis:

- Cadastro inicial.
- Entrar em projeto aprovado.
- Participar de grupo.
- Concluir atividade validada.
- Publicar projeto aprovado.
- Participar de evento com presenca confirmada.
- Receber badge institucional.

### UC17 - Administrar e moderar plataforma

Ator principal: Administrador/Sysadmin.

Objetivo: manter qualidade, seguranca e governanca da plataforma.

Estado atual:

- Existe usuario seedado `SYSADMIN`.
- Nao ha painel administrativo implementado.

Lacunas:

- CRUD administrativo de usuarios, grupos, projetos, eventos e oportunidades.
- Moderacao de conteudo denunciado.
- Aprovacao de grupos/projetos institucionais.
- Relatorios de engajamento.
- Auditoria de acoes sensiveis.

## Mapa de entidades recomendado

### Identidade e acesso

- `Usuario`: identidade base, login e dados essenciais.
- `Papel` ou enum de papel: estudante, professor, administrativo, coordenador, sysadmin, parceiro.
- `PerfilAcademico`: dados publicos academicos do usuario.
- `AreaInteresse`: interesses academicos ou tecnicos.
- `UsuarioAreaInteresse`: relacao N:N.
- `PasswordResetToken`: recuperacao segura de senha.

### Projetos

- `Projeto`: iniciativa academica publicada.
- `ProjetoMembro`: vinculo entre usuario e projeto.
- `ProjetoPapel`: autor, coordenador, colaborador, mentor, bolsista.
- `SolicitacaoEntradaProjeto`: pedido de entrada com status e avaliacao.
- `Tag`: tags normalizadas.
- `ProjetoTag`: relacao N:N.
- `ProjetoImagem` ou `Midia`: imagens e anexos.
- `ProjetoAtividade`: entregas, marcos ou acoes que podem gerar XP.

### Grupos

- `Grupo`: laboratorio, comunidade, nucleo, parceiro ou centro academico.
- `GrupoMembro`: vinculo entre usuario e grupo.
- `GrupoPapel`: coordenador, membro, convidado, parceiro.
- `SolicitacaoEntradaGrupo`: pedido para grupos restritos.
- `GrupoImagem` ou `Midia`: capa/logo.

### Oportunidades e vagas

- `Oportunidade`: mural geral de bolsas, estagios, monitorias, voluntariado e chamadas.
- `CandidaturaOportunidade`: candidatura de usuario.
- `OportunidadeRequisito` ou campo estruturado em JSON/texto, dependendo da complexidade.
- Relacionamentos opcionais com `Grupo`, `Projeto` e `Usuario` publicador.

### Eventos

- `Evento`: evento academico com data, local/modalidade e organizador.
- `InscricaoEvento`: inscricao e status.
- `PresencaEvento`: confirmacao de comparecimento, se necessario.
- `Certificado`: emissao ou link de certificado.

### Gamificacao

- `PontuacaoTransacao`: extrato imutavel de pontos/XP.
- `RegraPontuacao`: configuracao dos pontos por evento.
- `Conquista`: badge ou marco de reconhecimento.
- `UsuarioConquista`: conquistas recebidas.
- `RankingSnapshot`: ranking calculado por periodo, area ou escopo.

### Governanca

- `Notificacao`: mensagens internas sobre solicitacoes, aprovacoes, prazos e conquistas.
- `Auditoria`: registro de acoes sensiveis.
- `Denuncia` ou `Moderacao`: revisao de conteudo.

## Relacionamentos prioritarios para o banco

- Um `Usuario` possui um `PerfilAcademico`.
- Um `Usuario` pode criar muitos `Projetos`.
- Um `Projeto` pertence opcionalmente a um `Grupo`.
- Um `Grupo` possui muitos `Projetos`.
- Um `Usuario` participa de muitos `Projetos` via `ProjetoMembro`.
- Um `Usuario` participa de muitos `Grupos` via `GrupoMembro`.
- Uma `SolicitacaoEntradaProjeto` referencia um `Usuario`, um `Projeto` e um avaliador opcional.
- Uma `Oportunidade` pode pertencer a um `Grupo`, a um `Projeto` ou ser geral.
- Uma `CandidaturaOportunidade` referencia `Usuario` e `Oportunidade`.
- Um `Evento` pode ser organizado por `Usuario`, `Grupo` ou `Projeto`.
- Uma `PontuacaoTransacao` referencia `Usuario` e pode referenciar a origem: projeto, grupo, evento, oportunidade ou acao administrativa.

## Lacunas arquiteturais

### 1. Autenticacao e autorizacao

Hoje o backend autentica credenciais, mas nao estabelece um mecanismo robusto de sessao/autorizacao. A refatoracao deve introduzir JWT ou sessao segura e proteger endpoints por papel e propriedade.

Prioridade: alta.

### 2. Relacionamentos de dominio

Projeto, grupo, usuario e solicitacao ainda se conectam por strings em varios pontos. Isso impede integridade referencial, historico confiavel e consultas robustas.

Prioridade: alta.

### 3. Separacao entre prototipo de UI e dominio real

Membros de grupo, vagas e candidaturas estao em `localStorage`. Antes de evoluir produto, esses fluxos precisam virar entidades e APIs.

Prioridade: alta.

### 4. Taxonomia inconsistente

Campos como `categoria`, `tipo`, `area`, `visibilidade` e `status` precisam de vocabulario controlado. Sem isso, filtros, rankings e relatorios ficarao frageis.

Prioridade: media-alta.

### 5. Gamificacao ainda nao modelada

XP e pontos aparecem em projeto/perfil, mas nao ha extrato, regra, conquista ou ranking persistido.

Prioridade: media-alta, porque e parte central da proposta.

### 6. Eventos inexistentes no codigo

Eventos sao citados como funcionalidade central, mas ainda nao existem no dominio.

Prioridade: media.

### 7. Oportunidades submodeladas

Oportunidade existe como entidade simples, mas o produto promete mural completo com filtros, candidaturas e links externos.

Prioridade: media.

### 8. View unica em Angular

O projeto deve manter apenas a view Angular. A antiga view alternativa foi removida para evitar duplicidade de frontend e concentrar a refatoracao em uma unica interface.

Prioridade: media.

## Proposta de modulos de dominio

Uma divisao natural para a nova arquitetura:

- `identity`: usuarios, autenticacao, papeis e permissoes.
- `profile`: perfil academico, interesses, habilidades e historico publico.
- `projects`: projetos, membros, solicitacoes, tags e atividades.
- `groups`: grupos, membros, papeis e solicitacoes.
- `opportunities`: oportunidades, vagas e candidaturas.
- `events`: eventos, inscricoes, presencas e certificados.
- `gamification`: pontos, conquistas, rankings e regras.
- `notifications`: notificacoes e preferencias.
- `admin`: moderacao, auditoria e relatorios.

## Backlog recomendado por prioridade

### Prioridade 1 - Base para modelagem correta

- Manter Angular como view unica.
- Implementar autenticacao/autorizacao real.
- Trocar vinculos por texto por FKs.
- Criar `ProjetoMembro` e `GrupoMembro`.
- Persistir solicitacoes com usuario/projeto avaliador.
- Definir enums/tabelas de status, tipo e visibilidade.

### Prioridade 2 - Produto academico funcional

- Completar mural de oportunidades com CRUD e candidatura.
- Persistir vagas de grupo.
- Criar filtros/paginacao no backend.
- Criar perfil academico real com interesses e habilidades.
- Criar notificacoes basicas.

### Prioridade 3 - Diferencial do NEXUS HUB

- Modelar gamificacao com extrato de pontos.
- Criar conquistas/badges.
- Criar rankings por periodo, curso, grupo ou area.
- Criar eventos, inscricoes e presenca.
- Criar relatorios administrativos.

## Decisoes em aberto

- Quem pode criar projetos: qualquer usuario, apenas professores/coordenadores ou membros autorizados de grupo?
- Grupo aberto permite entrada imediata ou sempre precisa aprovacao?
- Projeto publico e privado definem apenas visualizacao ou tambem entrada/candidatura?
- Oportunidade e vaga de grupo serao a mesma entidade ou entidades separadas?
- Gamificacao deve pontuar automaticamente ou depender de validacao por responsavel?
- Perfil academico sera publico por padrao ou controlado por privacidade?
- A plataforma representa uma unica universidade ou multiplas instituicoes no futuro?
- O frontend Angular continuara como interface unica do projeto?

## Resumo executivo

O projeto atual ja valida a espinha dorsal da ideia: usuarios, projetos, grupos, oportunidades e solicitacoes. O maior trabalho antes da refatoracao e transformar o prototipo em dominio consistente: trocar strings por relacionamentos, mover regras do frontend para o backend, definir autorizacao real e modelar participacao como entidades de vinculo.

Para o banco, os primeiros modelos indispensaveis sao `Usuario`, `PerfilAcademico`, `Grupo`, `GrupoMembro`, `Projeto`, `ProjetoMembro`, `SolicitacaoEntradaProjeto`, `Tag`, `Oportunidade`, `CandidaturaOportunidade` e `PontuacaoTransacao`. Com esses elementos, a arquitetura passa a sustentar a proposta original do NEXUS HUB em vez de apenas demonstrar telas.
