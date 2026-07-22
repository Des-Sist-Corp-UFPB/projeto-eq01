# Identidade Visual

## Direcao de marca

O NEXUS HUB deve transmitir tecnologia, confianca academica, movimento e colaboracao. A identidade visual precisa parecer moderna e universitaria, mas sem perder seriedade institucional.

A gamificacao deve aparecer como reconhecimento de progresso, nao como jogo infantil. Por isso, a interface deve combinar uma base limpa com cores de destaque para pontos, conquistas, rankings e chamadas importantes.

## Paleta principal

### Azul Nexus

- Hex: `#1F7AE0`
- Uso: cor principal da marca, botoes primarios, links, destaques, icones importantes e elementos de navegacao ativos.
- Significado: tecnologia, confianca, clareza e conexao.

### Verde Movimento

- Hex: `#13A37C`
- Uso: estados positivos, progresso, participacao, projetos abertos, badges de conclusao e indicadores de atividade.
- Significado: crescimento, colaboracao e vida academica em movimento.

### Grafite Academico

- Hex: `#132033`
- Uso: textos principais, titulos, menus e areas de alta leitura.
- Significado: seriedade, foco e credibilidade.

### Cinza Campus

- Hex: `#65758B`
- Uso: textos secundarios, descricoes, metadados, placeholders e elementos auxiliares.
- Significado: neutralidade e organizacao.

### Branco Superficie

- Hex: `#FFFFFF`
- Uso: cards, paineis, formularios, modais e areas de conteudo.
- Significado: clareza, respiro e legibilidade.

### Fundo Claro

- Hex: `#F5F7FB`
- Uso: fundo geral da aplicacao no tema claro.
- Significado: leveza e ambiente limpo de trabalho.

## Cores de apoio

### Amarelo Conquista

- Hex: `#F5B82E`
- Uso: conquistas, medalhas, rankings, destaque de primeiros lugares e feedbacks de celebracao.
- Significado: reconhecimento, merito e recompensa.

### Laranja Energia

- Hex: `#F97316`
- Uso: chamadas urgentes, oportunidades com prazo, eventos proximos e alertas leves.
- Significado: atencao, movimento e oportunidade.

### Vermelho Alerta

- Hex: `#DC2626`
- Uso: erros, acoes destrutivas, recusas e alertas importantes.
- Significado: risco e necessidade de atencao.

### Roxo Jornada

- Hex: `#7C3AED`
- Uso: trilhas, missoes, niveis, badges especiais e areas de evolucao do usuario.
- Significado: progresso, trajetoria e descoberta.

## Tema claro

O tema claro deve ser o padrao inicial.

Tokens recomendados:

```css
:root {
  --color-primary: #1F7AE0;
  --color-secondary: #13A37C;
  --color-accent: #F5B82E;
  --color-warning: #F97316;
  --color-danger: #DC2626;
  --color-journey: #7C3AED;
  --color-background: #F5F7FB;
  --color-surface: #FFFFFF;
  --color-text: #132033;
  --color-muted: #65758B;
  --color-border: #DFE6F0;
}
```

Regras:

- Fundo geral em `#F5F7FB`.
- Cards e formularios em `#FFFFFF`.
- Titulos em `#132033`.
- Textos secundarios em `#65758B`.
- Botoes principais em `#1F7AE0`.
- Estados positivos em `#13A37C`.

## Tema escuro

O tema escuro deve ser usado como opcional, mantendo contraste e leitura confortavel.

Tokens recomendados:

```css
.dark {
  --color-primary: #4AA3FF;
  --color-secondary: #34D399;
  --color-accent: #FBBF24;
  --color-warning: #FB923C;
  --color-danger: #F87171;
  --color-journey: #A78BFA;
  --color-background: #0B1220;
  --color-surface: #111C2E;
  --color-text: #EAF1FB;
  --color-muted: #9AA8BC;
  --color-border: #243349;
}
```

Regras:

- Fundo geral em azul escuro neutro, nao preto puro.
- Cards em superficie levemente mais clara que o fundo.
- Azul e verde devem ficar mais luminosos para manter contraste.
- Evitar grandes areas com gradiente escuro.

## Aplicacao por contexto

### Projetos

- Cor principal: Azul Nexus `#1F7AE0`.
- Acoes: criar projeto, ver detalhes, solicitar entrada.
- Indicadores: status, categoria, responsavel e membros.

### Grupos

- Cor principal: Verde Movimento `#13A37C`.
- Acoes: entrar no grupo, ver membros, acompanhar projetos.
- Indicadores: membros ativos, area e ranking interno.

### Oportunidades

- Cor principal: Laranja Energia `#F97316`.
- Acoes: candidatar-se, abrir contato, compartilhar.
- Indicadores: prazo, tipo de oportunidade e status.

### Gamificacao

- Cor principal: Amarelo Conquista `#F5B82E`.
- Apoio: Roxo Jornada `#7C3AED`.
- Uso: pontos, medalhas, badges, ranking, niveis e progresso.

### Erros e acoes criticas

- Cor principal: Vermelho Alerta `#DC2626`.
- Uso restrito a erros, exclusoes, recusas e avisos de risco.

## Gradientes

Gradientes devem ser usados com moderacao, principalmente em areas de destaque e nao como base dominante da interface.

Gradiente principal:

```css
linear-gradient(135deg, #1F7AE0 0%, #13A37C 100%)
```

Uso recomendado:

- Hero institucional.
- Destaques de onboarding.
- Cards de conquistas especiais.
- Banner de campanha.

Evitar:

- Usar gradiente em todos os cards.
- Deixar a interface dominada por uma unica familia de cor.
- Usar gradientes roxos ou escuros como base principal.

## Tipografia

Sugestao:

- Titulos: `Inter`, `Montserrat` ou `Plus Jakarta Sans`.
- Corpo: `Inter`, `Open Sans` ou `Arial`.

Diretrizes:

- Titulos devem ser fortes, mas nao exagerados em telas internas.
- Texto de interface deve ser direto e legivel.
- Evitar fontes decorativas.
- Evitar letras muito condensadas.

## Componentes

### Botoes

- Primario: fundo Azul Nexus e texto branco.
- Secundario: fundo branco, borda clara e texto Grafite Academico.
- Positivo: fundo Verde Movimento.
- Destrutivo: fundo Vermelho Alerta.

### Cards

- Fundo branco no tema claro.
- Borda `#DFE6F0`.
- Raio de borda de ate `8px`.
- Usar sombra leve somente quando necessario.

### Badges

- Projeto aberto: Verde Movimento.
- Novo: Azul Nexus.
- Oportunidade urgente: Laranja Energia.
- Conquista: Amarelo Conquista.
- Nivel ou trilha: Roxo Jornada.

### Rankings

- Primeiro lugar: Amarelo Conquista.
- Segundo lugar: cinza claro metalico `#CBD5E1`.
- Terceiro lugar: bronze `#B7791F`.
- Demais posicoes: Cinza Campus.

## Iconografia

Usar icones simples, lineares e consistentes.

Temas recomendados:

- Rede.
- Nos.
- Trilhas.
- Medalhas.
- Alvo.
- Calendario.
- Usuarios.
- Livro.
- Mapa.
- Radar.

## Linguagem visual

A interface deve parecer:

- Organizada.
- Academica.
- Moderna.
- Colaborativa.
- Confiavel.
- Levemente gamificada.

A interface nao deve parecer:

- Infantil.
- Excessivamente colorida.
- Um jogo casual.
- Um painel corporativo frio demais.
- Uma landing page de marketing em todas as telas.

## Exemplo de distribuicao visual

- 60% base neutra: fundo, superficies e texto.
- 25% azul e verde: navegacao, acoes e estados principais.
- 10% amarelo, laranja e roxo: gamificacao, oportunidades e destaques.
- 5% vermelho: erros e acoes criticas.

## Resumo pratico

Use Azul Nexus para guiar a navegacao, Verde Movimento para participacao, Amarelo Conquista para reconhecimento, Laranja Energia para oportunidades e Grafite Academico para manter seriedade.

Essa combinacao comunica bem a proposta do NEXUS HUB: uma plataforma academica moderna, colaborativa e orientada a reconhecimento.
