package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.projects.domain.Project;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProjetoResponse(
        UUID id,
        String nome,
        String resumo,
        String objetivos,
        String categoria,
        String tipo,
        String tags,
        String visibilidade,
        String grupoPertencente,
        String autor,
        Integer curtidas,
        Integer quantidadeMembros,
        String imagemCardUrl,
        String imagemLandingUrl,
        Integer xpDistribuido,
        String status,
        Integer pontos,
        LocalDateTime criadoEm
) {
    public static ProjetoResponse from(Project project) {
        if (project == null) {
            return null;
        }
        return new ProjetoResponse(
                project.getId(),
                project.getName(),
                project.getResume(),
                project.getGoals(),
                project.getType() == null ? null : project.getType().toString(),
                project.getType() == null ? null : project.getType().toString(),
                null,
                project.getVisibilityStatus() == null ? null : project.getVisibilityStatus().toString(),
                project.getGroup() == null ? null : project.getGroup().getName(),
                project.getOwner() == null ? null : project.getOwner().getName(),
                0,
                0,
                project.getCoverUrl(),
                project.getLandingUrl(),
                project.getXpAmount(),
                project.getStatus() == null ? null : project.getStatus().toString(),
                project.getPoints(),
                project.getUpdatedAt()
        );
    }
}
