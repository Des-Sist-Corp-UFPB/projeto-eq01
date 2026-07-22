package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SolicitacaoRequest(
        @NotNull(message = "O ID do projeto e obrigatorio.")
        UUID projetoId,

        UUID usuarioId,

        String usuarioEmail,

        String usuarioNome,

        @NotBlank(message = "A justificativa ou motivo e obrigatoria.")
        String motivo
) {
}
