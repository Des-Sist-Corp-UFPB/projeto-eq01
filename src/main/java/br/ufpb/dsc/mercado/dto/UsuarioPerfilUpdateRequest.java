package br.ufpb.dsc.mercado.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para atualizar o perfil do usuario autenticado")
public record UsuarioPerfilUpdateRequest(
        @NotBlank(message = "O nome e obrigatorio")
        @Size(max = 120, message = "O nome deve ter no maximo 120 caracteres")
        @Schema(example = "Joao Silva")
        String nome,

        @Email(message = "Informe um e-mail valido")
        @NotBlank(message = "O e-mail e obrigatorio")
        @Size(max = 160, message = "O e-mail deve ter no maximo 160 caracteres")
        @Schema(example = "joao@email.com")
        String email,

        @Size(max = 72, message = "A senha deve ter no maximo 72 caracteres")
        @Schema(description = "Opcional. Envie vazio ou nulo para manter a senha atual.", example = "novaSenha123")
        String senha
) {
}
