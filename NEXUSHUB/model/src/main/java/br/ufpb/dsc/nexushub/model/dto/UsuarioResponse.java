package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.entity.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String cargo,
        String fotoUrl
) {
    public static UsuarioResponse from(Usuario usuario) {
        if (usuario == null) return null;
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getFotoUrl()
        );
    }
}
