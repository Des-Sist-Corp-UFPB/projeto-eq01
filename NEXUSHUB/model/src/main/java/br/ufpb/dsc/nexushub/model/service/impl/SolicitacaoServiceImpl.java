package br.ufpb.dsc.nexushub.model.service.impl;

import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest;
import br.ufpb.dsc.nexushub.model.entity.Projeto;
import br.ufpb.dsc.nexushub.model.entity.SolicitacaoEntrada;
import br.ufpb.dsc.nexushub.model.repository.ProjetoRepository;
import br.ufpb.dsc.nexushub.model.repository.SolicitacaoEntradaRepository;
import br.ufpb.dsc.nexushub.model.service.SolicitacaoService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SolicitacaoServiceImpl implements SolicitacaoService {

    private static final Logger log = LoggerFactory.getLogger(SolicitacaoServiceImpl.class);
    private final SolicitacaoEntradaRepository solicitacaoRepository;
    private final ProjetoRepository projetoRepository;

    public SolicitacaoServiceImpl(SolicitacaoEntradaRepository solicitacaoRepository, ProjetoRepository projetoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.projetoRepository = projetoRepository;
    }

    @Override
    @Transactional
    public SolicitacaoEntrada criar(SolicitacaoRequest request) {
        String email = request.usuarioEmail().trim().toLowerCase();
        log.info("[Solicitação Service] Criando nova solicitação de entrada. Projeto ID: {}, Usuário: '{}'", request.projetoId(), email);

        // Previne solicitações pendentes duplicadas
        List<SolicitacaoEntrada> pendentes = solicitacaoRepository.findByProjetoIdAndStatus(request.projetoId(), "PENDENTE");
        boolean jaExiste = pendentes.stream()
                .anyMatch(s -> s.getUsuarioEmail().equalsIgnoreCase(email));
        if (jaExiste) {
            log.warn("[Solicitação Service] Usuário '{}' já possui uma solicitação pendente para o projeto ID: {}", email, request.projetoId());
            throw new IllegalArgumentException("Você já enviou uma solicitação de participação para este projeto que está pendente de análise.");
        }

        // Recupera o projeto para salvar seu nome na solicitação
        Projeto projeto = projetoRepository.findById(request.projetoId())
                .orElseThrow(() -> {
                    log.error("[Solicitação Service] Projeto ID {} não encontrado para criação de solicitação.", request.projetoId());
                    return new IllegalArgumentException("Projeto não encontrado.");
                });

        SolicitacaoEntrada solicitacao = new SolicitacaoEntrada(
                request.projetoId(),
                projeto.getNome(),
                email,
                request.usuarioNome().trim(),
                request.motivo().trim()
        );

        SolicitacaoEntrada salva = solicitacaoRepository.save(solicitacao);
        log.info("[Solicitação Service] Solicitação ID {} criada com sucesso! Status: PENDENTE", salva.getId());
        return salva;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitacaoEntrada> listarPorProjeto(Long projetoId) {
        log.info("[Solicitação Service] Buscando solicitações para o projeto ID: {}", projetoId);
        return solicitacaoRepository.findByProjetoId(projetoId);
    }

    @Override
    @Transactional
    public void responder(Long id, boolean aprovado) {
        log.info("[Solicitação Service] Processando resposta para solicitação ID: {}. Aprovado: {}", id, aprovado);

        SolicitacaoEntrada solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("[Solicitação Service] Solicitação ID {} não encontrada.", id);
                    return new IllegalArgumentException("Solicitação não encontrada.");
                });

        if (!"PENDENTE".equalsIgnoreCase(solicitacao.getStatus())) {
            log.warn("[Solicitação Service] Tentativa de responder a uma solicitação já processada. ID: {}, Status Atual: {}", id, solicitacao.getStatus());
            throw new IllegalArgumentException("Esta solicitação já foi respondida e não pode ser modificada.");
        }

        if (aprovado) {
            solicitacao.setStatus("APROVADO");
            
            // Incrementar contagem de membros do projeto associado
            Projeto projeto = projetoRepository.findById(solicitacao.getProjetoId())
                    .orElseThrow(() -> {
                        log.error("[Solicitação Service] Projeto ID {} não encontrado para atualização de membros.", solicitacao.getProjetoId());
                        return new IllegalArgumentException("Projeto associado a esta solicitação não foi encontrado.");
                    });
            
            int membrosAtuais = projeto.getQuantidadeMembros() != null ? projeto.getQuantidadeMembros() : 0;
            projeto.setQuantidadeMembros(membrosAtuais + 1);
            projetoRepository.save(projeto);
            log.info("[Solicitação Service] Solicitação aprovada! Membros do projeto '{}' incrementados para {}", projeto.getNome(), projeto.getQuantidadeMembros());
        } else {
            solicitacao.setStatus("REJEITADO");
            log.info("[Solicitação Service] Solicitação ID {} foi REJEITADA.", id);
        }

        solicitacaoRepository.save(solicitacao);
    }
}
