package br.ufpb.dsc.nexushub.controller.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GroupDraftRequest(
        @NotBlank(message = "A ideia não pode estar vazia")
        @Size(max = 1200, message = "A ideia pode ter no máximo 1200 caracteres")
        String idea
) {
}
