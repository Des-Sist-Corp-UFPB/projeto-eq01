package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.entity.Projeto;
import java.time.LocalDateTime;

public record ProjetoResponse(
        Long id,
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
    public static ProjetoResponse from(Projeto projeto) {
        if (projeto == null) {
            return null;
        }
        return new ProjetoResponse(
                projeto.getId(),
                projeto.getNome(),
                projeto.getResumo(),
                projeto.getObjetivos(),
                projeto.getCategoria(),
                projeto.getTipo(),
                projeto.getTags(),
                projeto.getVisibilidade(),
                projeto.getGrupoPertencente(),
                projeto.getAutor(),
                projeto.getCurtidas(),
                projeto.getQuantidadeMembros(),
                projeto.getImagemCardUrl(),
                projeto.getImagemLandingUrl(),
                projeto.getXpDistribuido(),
                projeto.getStatus(),
                projeto.getPontos(),
                projeto.getCriadoEm()
        );
    }
}
