# Guia de Contribuição — Como garantir que seu trabalho apareça na avaliação

O relatório de avaliação mede contribuição de duas formas:

| Métrica | O que mede | Como é calculado |
|---------|-----------|-----------------|
| **Commits (main)** | Commits na branch principal | `git log --no-merges` na branch `main` |
| **Commits (GitHub API)** | Commits em qualquer branch | API do GitHub, todas as branches |
| **Linhas no código atual** | Quanto do código atual é "seu" | `git blame` na branch `main` |

Se você trabalhou mas apareceu com 0% ou poucos commits, a causa está em um (ou mais) dos três problemas abaixo.

---

## Problema 1 — Squash merge apaga a autoria

### O que acontece

Quando um Pull Request é mesclado via **"Squash and merge"**, todos os commits da branch viram **um único commit** assinado por quem clicou no botão. O trabalho original some do `git blame`.

```
feature/minha-branch:  A → B → C → D   (4 commits seus)
                                        ↓ squash merge
main:                  X → Y → Z       (1 commit da outra pessoa)
```

### Como corrigir

No GitHub, ao mesclar um Pull Request, **sempre use "Merge commit"** (não "Squash and merge", não "Rebase and merge"):

```
✅  Create a merge commit      ← use este
❌  Squash and merge           ← apaga sua autoria
❌  Rebase and merge           ← pode apagar sua autoria
```

Para travar isso no repositório (evitar o squash por acidente):

1. Vá em **Settings → General → Pull Requests**
2. Deixe marcado **apenas** `Allow merge commits`
3. Desmarque `Allow squash merging` e `Allow rebase merging`

---

## Problema 2 — E-mail do Git não está vinculado à sua conta GitHub

### O que acontece

O relatório liga seus commits ao seu **login do GitHub** pelo e-mail. Se o e-mail configurado no Git local for diferente do cadastrado no GitHub, seus commits aparecem como "sem login" ou somem.

### Como verificar

```bash
git config user.email
```

Compare com o e-mail em **github.com → Settings → Emails**.

### Como corrigir

Configure o mesmo e-mail no seu Git local:

```bash
git config --global user.email "seu-email@exemplo.com"
git config --global user.name  "Seu Nome"
```

> **Atenção:** se você usa o e-mail privado do GitHub (`123456+login@users.noreply.github.com`), adicione-o também nas configurações de e-mail do GitHub para que ele seja reconhecido.

---

## Problema 3 — Commits feitos pela interface web do GitHub

### O que acontece

Ao editar arquivos diretamente no github.com (botão ✏️), o GitHub usa o e-mail `ID+login@users.noreply.github.com`. Esse e-mail **geralmente é reconhecido**, mas só se o GitHub conseguir associá-lo ao seu usuário na API.

### Recomendação

Prefira sempre commitar pelo terminal com o Git configurado corretamente. Use a interface web apenas para operações simples (editar README, resolver conflitos simples).

---

## Resumo — checklist antes de cada entrega

```
[ ] git config user.email  →  deve ser igual ao e-mail no GitHub
[ ] git config user.name   →  deve ser seu nome real ou @ de usuário
[ ] PRs mesclados via "Create a merge commit" (não squash)
[ ] Cada integrante fez commits com o próprio Git configurado
[ ] Repositório tem "Allow squash merging" desativado nas Settings
```

---

## Workflow recomendado para trabalho em equipe

```bash
# 1. Crie sua branch a partir do main atualizado
git checkout main
git pull origin main
git checkout -b feature/minha-funcionalidade

# 2. Trabalhe e commite normalmente
git add .
git commit -m "feat: implementa X"

# 3. Antes de abrir PR, atualize com o main
git fetch origin
git merge origin/main        # ← merge normal, não rebase

# 4. Abra o PR e escolha "Create a merge commit" ao mesclar
```

---

## Por que o `git blame` é importante

O `git blame` identifica **quem escreveu cada linha do código que está em produção hoje**. Não é apenas quem adicionou — é quem fez o último `commit` que tocou aquela linha.

Se você refatorou, corrigiu ou expandiu o código de outra pessoa, as linhas que você tocou passam a ser suas no blame. Por isso:

- Commits pequenos e frequentes mostram melhor sua contribuição
- Trabalhar apenas em arquivos novos (sem tocar nos existentes) reduz sua visibilidade no blame, mesmo que o trabalho seja relevante
- O blame é complementar à contagem de commits — ambos são considerados

---

*Dúvidas? Fale com o professor ou abra uma issue no repositório da disciplina.*
