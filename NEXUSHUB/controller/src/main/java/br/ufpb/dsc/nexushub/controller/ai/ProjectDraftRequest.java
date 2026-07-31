package br.ufpb.dsc.nexushub.controller.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectDraftRequest(
        @NotBlank(message = "Descreva a ideia do projeto.")
        @Size(max = 1200, message = "A ideia deve ter no maximo 1200 caracteres.")
        String idea) {
}
