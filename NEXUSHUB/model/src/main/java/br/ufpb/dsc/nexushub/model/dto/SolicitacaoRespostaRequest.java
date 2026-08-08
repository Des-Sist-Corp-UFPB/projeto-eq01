package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotNull;

public record SolicitacaoRespostaRequest(
    @NotNull(message = "A decisão (aprovado ou rejeitado) é obrigatória.")
    Boolean aprovado
) {}
