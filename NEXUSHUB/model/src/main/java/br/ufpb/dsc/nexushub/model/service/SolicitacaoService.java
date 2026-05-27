package br.ufpb.dsc.nexushub.model.service;

import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest;
import br.ufpb.dsc.nexushub.model.entity.SolicitacaoEntrada;
import java.util.List;

public interface SolicitacaoService {

    SolicitacaoEntrada criar(SolicitacaoRequest request);

    List<SolicitacaoEntrada> listarPorProjeto(Long projetoId);

    void responder(Long id, boolean aprovado);
}
