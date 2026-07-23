# Como Rodar os Testes Localmente

Este documento ensina o passo a passo para você mesmo executar a suíte de testes do sistema NexusHub através do terminal.

## Passo 1: Acesse a pasta correta
Abra o seu terminal (PowerShell ou Prompt de Comando/CMD) e navegue até a pasta onde os scripts de teste estão localizados usando o comando `cd`:

```bash
cd "c:\Users\Silva\OneDrive\Área de Trabalho\DSC\projeto-eq01\NEXUSHUB\testes_metodos"
```

## Passo 2: Execute o Script de Testes

O comando para rodar os testes depende do terminal que você está utilizando. Escolha a opção correspondente ao seu ambiente:

### Opção A: Usando o PowerShell no Windows
Por padrão, o Windows pode bloquear a execução de scripts `.ps1` por questões de segurança. Para rodar o script de testes contornando essa restrição (apenas para este comando), utilize:

```powershell
powershell -ExecutionPolicy Bypass -File .\executar_testes.ps1
```

### Opção B: Usando o Prompt de Comando (CMD) no Windows
Se você estiver usando o prompt tradicional (`cmd.exe`), pode simplesmente executar o arquivo `.bat` preparado:

```cmd
executar_testes.bat
```
*(Ou então, basta dar dois cliques no arquivo `executar_testes.bat` diretamente pelo Explorador de Arquivos do Windows).*

### Opção C: Usando Linux ou macOS (Terminal Bash)
Caso o projeto seja executado em um ambiente Unix, dê a permissão de execução ao script e rode-o:

```bash
chmod +x executar_testes.sh
./executar_testes.sh
```

---

Ao rodar qualquer um dos comandos acima, o sistema irá utilizar o Maven para compilar e executar toda a suíte de testes (20 testes divididos em vários módulos). No fim, você verá um resumo confirmando se os testes passaram.
