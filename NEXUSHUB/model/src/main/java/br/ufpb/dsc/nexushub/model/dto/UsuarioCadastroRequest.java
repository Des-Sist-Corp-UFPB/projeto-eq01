package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioCadastroRequest(
        @NotBlank String nome,
        @NotBlank String email,
        String senha,
        String cargo,
        String fotoUrl,
        @NotNull Boolean lgpdConsent
) {
}
