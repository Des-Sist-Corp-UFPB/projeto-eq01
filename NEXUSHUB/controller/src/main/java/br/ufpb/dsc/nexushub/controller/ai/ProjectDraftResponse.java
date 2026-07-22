package br.ufpb.dsc.nexushub.controller.ai;

public record ProjectDraftResponse(
        String nome,
        String resumo,
        String objetivos,
        String categoria,
        String tipo,
        String tags) {
}
