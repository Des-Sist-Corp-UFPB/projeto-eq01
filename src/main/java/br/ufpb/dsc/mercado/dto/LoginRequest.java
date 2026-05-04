package br.ufpb.dsc.mercado.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciais de login")
public record LoginRequest(
        @NotBlank(message = "O usuario e obrigatorio")
        @Schema(example = "joao")
        String username,

        @NotBlank(message = "A senha e obrigatoria")
        @Schema(example = "123456")
        String senha
) {
}
