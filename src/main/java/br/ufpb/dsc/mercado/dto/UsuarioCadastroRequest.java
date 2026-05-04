package br.ufpb.dsc.mercado.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criar um usuario")
public record UsuarioCadastroRequest(
        @NotBlank(message = "O nome e obrigatorio")
        @Size(max = 120, message = "O nome deve ter no maximo 120 caracteres")
        @Schema(example = "Joao Silva")
        String nome,

        @NotBlank(message = "O usuario e obrigatorio")
        @Size(min = 3, max = 60, message = "O usuario deve ter entre 3 e 60 caracteres")
        @Schema(example = "joao")
        String username,

        @Email(message = "Informe um e-mail valido")
        @NotBlank(message = "O e-mail e obrigatorio")
        @Size(max = 160, message = "O e-mail deve ter no maximo 160 caracteres")
        @Schema(example = "joao@email.com")
        String email,

        @NotBlank(message = "A senha e obrigatoria")
        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
        @Schema(example = "123456")
        String senha
) {
}
