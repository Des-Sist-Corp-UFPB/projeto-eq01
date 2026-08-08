package br.ufpb.dsc.nexushub.model.dto;

import java.util.UUID;

public record PessoaCardResponse(
        UUID id,
        String nome,
        String username,
        String cargo,
        String userType,
        String fotoUrl,
        String curso,
        String periodo,
        long projetosCount,
        long seguidoresCount,
        boolean isFollowing
) {
}
