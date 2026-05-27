package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SolicitacaoRequest(
    @NotNull(message = "O ID do projeto é obrigatório.")
    Long projetoId,

    @NotBlank(message = "O e-mail do usuário é obrigatório.")
    String usuarioEmail,

    @NotBlank(message = "O nome do usuário é obrigatório.")
    String usuarioNome,

    @NotBlank(message = "A justificativa ou motivo é obrigatório.")
    String motivo
) {}
