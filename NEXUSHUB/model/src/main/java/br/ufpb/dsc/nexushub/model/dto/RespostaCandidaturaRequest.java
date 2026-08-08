package br.ufpb.dsc.nexushub.model.dto;

import java.util.UUID;

public record RespostaCandidaturaRequest(
        UUID idPergunta,
        String respostaText
) {}
