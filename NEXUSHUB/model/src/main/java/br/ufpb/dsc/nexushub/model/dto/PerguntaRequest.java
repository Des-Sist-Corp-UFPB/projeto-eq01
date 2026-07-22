package br.ufpb.dsc.nexushub.model.dto;

import java.util.List;

public record PerguntaRequest(
        String label,
        Integer tipo, // 1 = SHORT_ANSWER, 2 = MULTIPLE_CHOICE, 3 = SINGLE_CHOICE
        boolean obrigatoria,
        Integer ordem,
        List<String> opcoes
) {}
