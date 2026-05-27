package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCadastroRequest(
        @NotBlank String nome,
        @NotBlank String email,
        @NotBlank @Size(min = 6) String senha,
        String cargo
) {
}
