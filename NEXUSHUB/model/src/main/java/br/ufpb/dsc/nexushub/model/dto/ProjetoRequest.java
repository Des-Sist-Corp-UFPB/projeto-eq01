package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjetoRequest(
        @NotBlank String nome,
        @NotBlank String resumo,
        String objetivos,
        String categoria,
        String tipo,
        String tags,
        String visibilidade,
        String grupoPertencente,
        String autor,
        String imagemCardUrl,
        String imagemLandingUrl,
        Integer xpDistribuido
) {
}
