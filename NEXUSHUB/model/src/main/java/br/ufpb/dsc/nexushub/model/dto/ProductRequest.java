package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        UUID shopId,
        @NotBlank(message = "Título do item não pode ser vazio") String title,
        String description,
        String category,
        @NotNull(message = "Preço é obrigatório") BigDecimal price,
        @NotNull(message = "Estoque é obrigatório") Integer stock,
        String photos,
        @NotBlank(message = "Métodos de pagamento são obrigatórios") String paymentMethods,
        String pixKey,
        String meetLocations,
        @NotBlank(message = "Campus de retirada é obrigatório") String campus,
        @NotNull boolean active
) {}
