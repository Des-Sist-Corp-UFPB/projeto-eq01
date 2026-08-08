package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.groups.domain.Group;
import java.util.UUID;

public record GrupoResponse(
        UUID id,
        String nome,
        String descricao,
        String area,
        String responsavel,
        String tipo,
        String cor,
        String logo
) {
    public static GrupoResponse from(Group group) {
        return from(group, null);
    }

    public static GrupoResponse from(Group group, String responsavel) {
        if (group == null) {
            return null;
        }
        return new GrupoResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                formatArea(group.getType()),
                responsavel,
                formatStatus(group.getStatus()),
                group.getColorCode(),
                group.getLogoUrl()
        );
    }

    private static String formatArea(Integer type) {
        if (type == null) {
            return null;
        }
        return switch (type) {
            case 2 -> "Comunidade";
            case 3 -> "Externo";
            default -> "Institucional";
        };
    }

    private static String formatStatus(Integer status) {
        if (status == null) {
            return null;
        }
        return status == 2 ? "Restrito" : "Aberto";
    }
}
