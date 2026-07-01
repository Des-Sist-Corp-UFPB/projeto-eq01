package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.identity.domain.User;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        String email,
        String cargo,
        String fotoUrl
) {
    public static UsuarioResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new UsuarioResponse(
                user.getId(),
                user.getHuman().getName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getHuman().getPhotoUrl()
        );
    }
}
