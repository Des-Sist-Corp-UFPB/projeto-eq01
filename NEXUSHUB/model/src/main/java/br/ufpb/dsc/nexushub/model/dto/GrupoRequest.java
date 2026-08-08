package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record GrupoRequest(
        @NotBlank String nome,
        @NotBlank String descricao,
        String area,
        String responsavel,
        String tipo,
        String cor,
        String logo,
        UUID criadorId
) {
}
