package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import java.time.LocalDate;
import java.util.UUID;

public record OportunidadeResponse(
        UUID id,
        String titulo,
        String descricao,
        String tipo,
        String contato,
        LocalDate prazo
) {
    public static OportunidadeResponse from(Opportunity opportunity) {
        if (opportunity == null) {
            return null;
        }
        return new OportunidadeResponse(
                opportunity.getId(),
                opportunity.getName(),
                opportunity.getDescription(),
                opportunity.getType() == null ? null : opportunity.getType().toString(),
                opportunity.getPublisher() == null ? null : opportunity.getPublisher().getEmail(),
                opportunity.getDeadline()
        );
    }
}
