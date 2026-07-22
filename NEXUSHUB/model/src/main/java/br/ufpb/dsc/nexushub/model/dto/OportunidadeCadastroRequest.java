package br.ufpb.dsc.nexushub.model.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OportunidadeCadastroRequest(
        String titulo,
        String descricao,
        Integer tipo,
        UUID idGrupo,
        UUID idProjeto,
        Integer tagType,
        boolean pago,
        String remuneracao,
        boolean usaFormulario,
        String telefoneContato,
        LocalDate prazo,
        String urlInscricao,
        List<PerguntaRequest> perguntas
) {}
