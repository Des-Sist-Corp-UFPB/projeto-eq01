package br.ufpb.dsc.mercado.dto;

import br.ufpb.dsc.mercado.domain.Usuario;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Dados publicos do usuario")
public record UsuarioResponse(
        Long id,
        String nome,
        String username,
        String email,
        String papel,
        boolean ativo,
        Instant criadoEm,
        Instant atualizadoEm
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getPapel(),
                usuario.isAtivo(),
                usuario.getCriadoEm(),
                usuario.getAtualizadoEm()
        );
    }
}
