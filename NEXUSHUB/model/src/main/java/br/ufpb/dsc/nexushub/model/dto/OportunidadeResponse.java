package br.ufpb.dsc.nexushub.model.dto;

import br.ufpb.dsc.nexushub.model.opportunities.domain.Opportunity;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OportunidadeResponse(
        UUID id,
        String titulo,
        String descricao,
        String tipo,
        Integer status,
        LocalDate prazo,
        String urlInscricao,
        UUID idGrupo,
        String nomeGrupo,
        UUID idProjeto,
        String nomeProjeto,
        UUID idPublicador,
        String nomePublicador,
        String tipoUsuarioPublicador,
        Integer tagType,
        boolean pago,
        String remuneracao,
        boolean usaFormulario,
        String telefoneContato,
        FormularioResponse formulario
) {
    public static OportunidadeResponse from(Opportunity opportunity) {
        return from(opportunity, null);
    }

    public static OportunidadeResponse from(Opportunity opportunity, FormularioResponse form) {
        if (opportunity == null) {
            return null;
        }
        return new OportunidadeResponse(
                opportunity.getId(),
                opportunity.getName(),
                opportunity.getDescription(),
                opportunity.getType() == null ? null : opportunity.getType().toString(),
                opportunity.getStatus(),
                opportunity.getDeadline(),
                opportunity.getApplyUrl(),
                opportunity.getGroup() == null ? null : opportunity.getGroup().getId(),
                opportunity.getGroup() == null ? null : opportunity.getGroup().getName(),
                opportunity.getProject() == null ? null : opportunity.getProject().getId(),
                opportunity.getProject() == null ? null : opportunity.getProject().getName(),
                opportunity.getPublisher() == null ? null : opportunity.getPublisher().getId(),
                opportunity.getPublisher() == null ? null : opportunity.getPublisher().getName(),
                opportunity.getPublisher() == null ? null : opportunity.getPublisher().getUserType(),
                opportunity.getTagType(),
                opportunity.isPaid(),
                opportunity.getRemuneration(),
                opportunity.isUseForm(),
                opportunity.getContactPhone(),
                form
        );
    }

    public record FormularioResponse(
            UUID id,
            String nome,
            List<PerguntaResponse> perguntas
    ) {}

    public record PerguntaResponse(
            UUID id,
            String label,
            Integer tipo,
            boolean obrigatoria,
            Integer ordem,
            List<OpcaoResponse> opcoes
    ) {}

    public record OpcaoResponse(
            UUID id,
            String nome,
            Integer ordem
    ) {}
}
