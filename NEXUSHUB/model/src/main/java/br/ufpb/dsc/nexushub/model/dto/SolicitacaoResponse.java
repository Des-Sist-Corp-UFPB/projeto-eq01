package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.projects.domain.ProjectRequest;
import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitacaoResponse(
        UUID id,
        UUID projetoId,
        String projetoNome,
        UUID usuarioId,
        String usuarioEmail,
        String usuarioNome,
        String motivo,
        String status,
        LocalDateTime criadoEm
) {
    public static SolicitacaoResponse from(ProjectRequest request) {
        if (request == null) {
            return null;
        }
        return new SolicitacaoResponse(
                request.getId(),
                request.getProject().getId(),
                request.getProject().getName(),
                request.getRequester().getId(),
                request.getRequester().getEmail(),
                request.getRequester().getName(),
                request.getMotive(),
                request.getRequestStatus() == null ? null : request.getRequestStatus().toString(),
                request.getUpdatedAt()
        );
    }
}
