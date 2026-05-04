package br.ufpb.dsc.mercado.dto;

import java.time.Instant;
import java.util.List;

public record ErroResponse(
        Instant timestamp,
        int status,
        String erro,
        List<String> mensagens
) {
}
