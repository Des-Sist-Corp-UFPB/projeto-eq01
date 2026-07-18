package br.ufpb.dsc.nexushub.model.dto;

import java.util.List;

public record CandidaturaRequest(
        String mensagem,
        String telefone,
        List<RespostaCandidaturaRequest> respostas
) {}
