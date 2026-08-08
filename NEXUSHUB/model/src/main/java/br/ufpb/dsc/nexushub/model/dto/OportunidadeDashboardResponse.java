package br.ufpb.dsc.nexushub.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OportunidadeDashboardResponse(
        UUID idOportunidade,
        String titulo,
        Integer status,
        int totalCandidatos,
        List<CandidaturaDashboardResponse> candidaturas
) {
    public record CandidaturaDashboardResponse(
            UUID idCandidatura,
            UUID idCandidato,
            String nomeCandidato,
            String emailCandidato,
            String mensagem,
            String telefone,
            Integer status,
            LocalDateTime dataEnvio,
            List<RespostaDashboardResponse> respostas
    ) {}

    public record RespostaDashboardResponse(
            UUID idPergunta,
            String labelPergunta,
            String respostaText
    ) {}
}
